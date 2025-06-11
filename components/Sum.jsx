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
            const amount = Number(item.jpy) || 0;
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
        <div>
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