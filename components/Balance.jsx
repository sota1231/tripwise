import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Balance.css';
import { getAllDisplayRecords, savePaymentComplete, getPaymentComplete } from './LocalInputData';

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
            await savePaymentComplete(
                selectedProjectRecord.id,
                currentUser.displayName,
                today
            );
            setPaymentComplete({
                completedBy: currentUser.displayName,
                completedDate: today
            });
            alert('支払い完了を記録しました');
        } catch (error) {
            console.error('支払い完了記録エラー:', error);
            alert('記録に失敗しました');
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
                    <button
                        className="payment-complete-button"
                        onClick={handlePaymentComplete}
                    >
                        支払い完了
                    </button>
                    {paymentComplete && (
                        <div className="payment-complete-info">
                            <p>
                                <strong>{paymentComplete.completedBy}</strong>が
                                <strong>{paymentComplete.completedDate}</strong>に
                                ボタンを押下しました
                            </p>
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
