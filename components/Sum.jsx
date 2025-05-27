import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import './Sum.css';

const Sum = ({ user, selectedProjectId, onDeleteInputData }) => {
    const [inputData, setInputData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "input_data"),
            where("userId", "==", user.uid),
            where("projectId", "==", selectedProjectId)
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const input_data = [];
            querySnapshot.forEach((doc) => {
                input_data.push({ ...doc.data(), id: doc.id });
            });
            setInputData(input_data);
        });
        return () => unsubscribe();
    }, [user, selectedProjectId]);

    // 項目ごとの集計を計算
    const calculateSummary = () => {
        const summary = {
            trafic: 0,
            food: 0,
            accommodation: 0,
            total: 0
        };

        inputData.forEach(item => {
            const amount = Number(item.money) || 0;
            summary[item.kind] += amount;
            summary.total += amount;
        });

        return summary;
    };

    const summary = calculateSummary();

    // 項目名を日本語に変換
    const getKindName = (kind) => {
        const kinds = {
            trafic: '交通・移動',
            food: '食事・飲み物',
            accommodation: '宿泊費'
        };
        return kinds[kind] || kind;
    };

    return (
        <div className="sum-container">
            <div className="sum-table">
                <div className="table-header">
                    <div className="table-row">
                        <div className="table-cell kind">項目</div>
                        <div className="table-cell name">品目</div>
                        <div className="table-cell money">金額</div>
                        <div className="table-cell memo"></div>
                    </div>
                </div>
                {inputData.map((data) => (
                    <Link to="/update" key={data.id} className="table-row">
                        <div className="table-cell kind">{getKindName(data.kind)}</div>
                        <div className="table-cell name">{data.name || '名前入力なし'}</div>
                        <div className="table-cell money">¥{Number(data.money).toLocaleString()}</div>
                        <div className="table-cell memo"></div>
                        <button 
                            className="delete-button"
                            onClick={() => onDeleteInputData(data.id)}
                        >
                            削除
                        </button>
                    </Link>
                ))}
            </div>

            <div className="summary-section">
                <h2 className="summary-title">集計</h2>
                <div className="summary-item">
                    <span className="summary-label">交通・移動</span>
                    <span className="summary-value">¥{summary.trafic.toLocaleString()}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">食事・飲み物</span>
                    <span className="summary-value">¥{summary.food.toLocaleString()}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">宿泊費</span>
                    <span className="summary-value">¥{summary.accommodation.toLocaleString()}</span>
                </div>
                <div className="summary-item total-row">
                    <span className="summary-label">合計</span>
                    <span className="summary-value">¥{summary.total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default Sum;