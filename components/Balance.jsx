import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Balance.css';
import { getAllDisplayRecords, savePaymentComplete, getPaymentComplete, addVerifiedUserToProject, saveProjectRecord, removePaymentCompleteByUser } from './LocalInputData';
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Balance = ({ selectedProjectRecord, currentUser }) => {
    const navigate = useNavigate();
    const [balances, setBalances] = useState({
        sota: 0,
        marina: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [paymentComplete, setPaymentComplete] = useState(null);

    // プロジェクト未選択の場合TOPに遷移
    useEffect(() => {
        if (!selectedProjectRecord) {
            navigate("/");
        }
    }, [selectedProjectRecord, navigate]);

    // 支払い完了情報を読み込む
    useEffect(() => {
        const loadPaymentComplete = async () => {
            if (!selectedProjectRecord) return;
            try {
                const payment = await getPaymentComplete(selectedProjectRecord.id);
                setPaymentComplete(payment);
            } catch (error) {
                console.error('支払い完了情報の読み込みエラー:', error);
            }
        };
        loadPaymentComplete();
    }, [selectedProjectRecord]);

    // データを読み込んで貸し借りを計算
    useEffect(() => {
        const loadBalance = async () => {
            if (!selectedProjectRecord) return;

            try {
                const allRecords = await getAllDisplayRecords();
                const projectRecords = allRecords.filter(
                    record => record.projectId === selectedProjectRecord.id
                );

                // 各ユーザーの支払い合計を計算
                let sotaPaid = 0;
                let marinaPaid = 0;
                const userTransactions = [];

                projectRecords.forEach(record => {
                    const amount = Number(record.jpy) || 0;
                    const people = Number(record.people) || 1;
                    const perPerson = amount / people;

                    if (record.paidBy === 'sota') {
                        sotaPaid += amount;
                        userTransactions.push({
                            name: record.name,
                            paidBy: 'sota',
                            total: amount,
                            perPerson: perPerson,
                            people: people,
                            date: record.modDate
                        });
                    } else if (record.paidBy === 'marina') {
                        marinaPaid += amount;
                        userTransactions.push({
                            name: record.name,
                            paidBy: 'marina',
                            total: amount,
                            perPerson: perPerson,
                            people: people,
                            date: record.modDate
                        });
                    }
                });

                // 総支払額
                const totalPaid = sotaPaid + marinaPaid;

                // 各自が負担すべき金額（2人で割り勘の場合）
                const shouldPayEach = totalPaid / 2;

                // 貸し借り計算
                const sotaBalance = sotaPaid - shouldPayEach;
                const marinaBalance = marinaPaid - shouldPayEach;

                setBalances({
                    sota: sotaBalance,
                    marina: marinaBalance
                });

                setTransactions(userTransactions);

            } catch (error) {
                console.error('データ読み込みエラー:', error);
            }
        };

        loadBalance();
    }, [selectedProjectRecord]);

    // 支払い完了ボタンの処理
    const handlePaymentComplete = async () => {
        if (!currentUser) {
            alert('ログインしてください');
            return;
        }

        const today = new Date().toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        try {
            // 支払い完了情報を保存
            await savePaymentComplete(
                selectedProjectRecord.id,
                currentUser.displayName,
                today
            );

            // IndexedDBにユーザーを追加
            await addVerifiedUserToProject(
                selectedProjectRecord.id,
                currentUser.displayName
            );

            // Firebaseのプロジェクトデータにユーザーを追加
            const projectRef = doc(db, "project_data", selectedProjectRecord.id);

            // ドキュメントの存在確認
            const docSnap = await getDoc(projectRef);

            let updatedVerifiedUsers = [];
            if (docSnap.exists()) {
                // ドキュメントが存在する場合は更新
                await updateDoc(projectRef, {
                    verifiedUsers: arrayUnion(currentUser.displayName)
                });
                // 更新後のverifiedUsersを取得
                const updatedDoc = await getDoc(projectRef);
                updatedVerifiedUsers = updatedDoc.data().verifiedUsers || [];
            } else {
                // ドキュメントが存在しない場合は作成
                updatedVerifiedUsers = [currentUser.displayName];
                await setDoc(projectRef, {
                    ...selectedProjectRecord,
                    verifiedUsers: updatedVerifiedUsers
                });
            }

            // IndexedDBのプロジェクトレコードも更新
            await saveProjectRecord({
                ...selectedProjectRecord,
                verifiedUsers: updatedVerifiedUsers
            });

            // 更新後の支払い完了情報を再読み込み
            const updatedPayment = await getPaymentComplete(selectedProjectRecord.id);
            setPaymentComplete(updatedPayment);

            alert('支払い完了を記録しました');
        } catch (error) {
            console.error('支払い完了記録エラー:', error);
            alert('記録に失敗しました');
        }
    };

    // 支払い完了取り消しボタンの処理
    const handleCancelPayment = async () => {
        if (!currentUser) {
            alert('ログインしてください');
            return;
        }

        if (!window.confirm('支払い完了を取り消しますか？')) {
            return;
        }

        try {
            // IndexedDBから該当ユーザーの支払い完了記録を削除
            await removePaymentCompleteByUser(
                selectedProjectRecord.id,
                currentUser.displayName
            );

            // Firebaseからユーザーを削除
            const projectRef = doc(db, "project_data", selectedProjectRecord.id);
            const docSnap = await getDoc(projectRef);

            if (docSnap.exists()) {
                const currentVerifiedUsers = docSnap.data().verifiedUsers || [];
                const updatedVerifiedUsers = currentVerifiedUsers.filter(
                    user => user !== currentUser.displayName
                );

                await updateDoc(projectRef, {
                    verifiedUsers: updatedVerifiedUsers
                });

                // IndexedDBのプロジェクトレコードも更新
                await saveProjectRecord({
                    ...selectedProjectRecord,
                    verifiedUsers: updatedVerifiedUsers
                });
            }

            // 更新後の支払い完了情報を再読み込み
            const updatedPayment = await getPaymentComplete(selectedProjectRecord.id);
            setPaymentComplete(updatedPayment);

            alert('支払い完了を取り消しました');
        } catch (error) {
            console.error('取り消しエラー:', error);
            alert('取り消しに失敗しました');
        }
    };

    // 誰がいくら払うべきかを表示
    const renderBalanceMessage = () => {
        if (balances.sota > 0) {
            return (
                <div className="balance-message positive">
                    <p>marinaがsotaに <strong>¥{Math.abs(balances.marina).toLocaleString()}</strong> 払う</p>
                </div>
            );
        } else if (balances.marina > 0) {
            return (
                <div className="balance-message positive">
                    <p>sotaがmarinaに <strong>¥{Math.abs(balances.sota).toLocaleString()}</strong> 払う</p>
                </div>
            );
        } else {
            return (
                <div className="balance-message neutral">
                    <p>貸し借りはありません</p>
                </div>
            );
        }
    };

    return (
        <div className="balance-container">
            <h2 className="balance-title">貸し借り</h2>

            <div className="balance-cards">
                <div className="balance-card">
                    <div className="balance-user-name">sota</div>
                    <div className={`balance-amount ${balances.sota >= 0 ? 'positive' : 'negative'}`}>
                        {balances.sota >= 0 ? '+' : ''}{balances.sota.toLocaleString()}円
                    </div>
                    <div className="balance-label">
                        {balances.sota > 0 ? '受け取る' : balances.sota < 0 ? '支払う' : '精算済み'}
                    </div>
                </div>

                <div className="balance-card">
                    <div className="balance-user-name">marina</div>
                    <div className={`balance-amount ${balances.marina >= 0 ? 'positive' : 'negative'}`}>
                        {balances.marina >= 0 ? '+' : ''}{balances.marina.toLocaleString()}円
                    </div>
                    <div className="balance-label">
                        {balances.marina > 0 ? '受け取る' : balances.marina < 0 ? '支払う' : '精算済み'}
                    </div>
                </div>
            </div>

            {renderBalanceMessage()}

            {currentUser && (
                <div className="payment-complete-section">
                    <div className="payment-buttons">
                        <button
                            className="payment-complete-button"
                            onClick={handlePaymentComplete}
                        >
                            支払い完了
                        </button>
                        <button
                            className="payment-cancel-button"
                            onClick={handleCancelPayment}
                        >
                            取り消し
                        </button>
                    </div>
                    {paymentComplete && paymentComplete.payments && paymentComplete.payments.length > 0 && (
                        <div className="payment-complete-info">
                            <h4 className="payment-status-title">現在の状態</h4>
                            {paymentComplete.payments.map((payment, index) => (
                                <p key={index}>
                                    <strong>{payment.completedBy}</strong>が
                                    <strong>{payment.completedDate}</strong>に
                                    ボタンを押下しました
                                </p>
                            ))}
                        </div>
                    )}
                    {paymentComplete && paymentComplete.history && paymentComplete.history.length > 0 && (
                        <div className="payment-history">
                            <h4 className="payment-history-title">履歴</h4>
                            <div className="payment-history-list">
                                {paymentComplete.history.slice().reverse().map((record, index) => (
                                    <div key={index} className={`history-item ${record.action}`}>
                                        <span className="history-icon">
                                            {record.action === 'completed' ? '✓' : '✕'}
                                        </span>
                                        <span className="history-text">
                                            <strong>{record.completedBy}</strong>が
                                            <strong>{record.completedDate}</strong>に
                                            {record.action === 'completed' ? '支払い完了' : '取り消し'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="transactions-section">
                <h3 className="transactions-title">支払い履歴</h3>
                {transactions.length === 0 ? (
                    <p className="no-data">データがありません</p>
                ) : (
                    <div className="transactions-list">
                        {transactions.map((tx, index) => (
                            <div key={index} className="transaction-item">
                                <div className="transaction-header">
                                    <span className={`payer-badge ${tx.paidBy}`}>
                                        {tx.paidBy}
                                    </span>
                                    <span className="transaction-date">{tx.date}</span>
                                </div>
                                <div className="transaction-name">{tx.name}</div>
                                <div className="transaction-details">
                                    <span className="transaction-total">¥{tx.total.toLocaleString()}</span>
                                    {tx.people > 1 && (
                                        <span className="transaction-per-person">
                                            （{tx.people}人で割り勘: 1人¥{Math.round(tx.perPerson).toLocaleString()}）
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Balance;
