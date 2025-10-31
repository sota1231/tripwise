import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import './Sum.css';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Sum = ({ onDeleteInputData, selectedProjectRecord }) => {
    const [inputData, setInputData] = useState([]);
    const [activeChart, setActiveChart] = useState('pie'); // 'pie' or 'bar'
    const navigate = useNavigate();

    console.log('selectedProjectRecord: '+selectedProjectRecord.id)
    useEffect(() => {
        const q = query(
            collection(db, "input_data"),
            where("projectId", "==", selectedProjectRecord.id)
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const input_data = [];
            querySnapshot.forEach((doc) => {
                input_data.push({ ...doc.data(), id: doc.id });
            });
            setInputData(input_data);
        });
        return () => unsubscribe();
    }, [selectedProjectRecord]);

    // 項目ごとの集計を計算
    const calculateSummary = () => {
        const summary = {
            trafic: 0,
            food: 0,
            accommodation: 0,
            plane: 0,
            entertainment: 0,
            total: 0
        };

        inputData.forEach(item => {
            const people = item.people || 1;
            const amount = Math.round(Number(item.jpy) / people) || 0;
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
            accommodation: '宿泊費',
            plane: '飛行機',
            entertainment: '娯楽費'
        };
        return kinds[kind] || kind;
    };

    const chartData = {
        labels: ['交通・移動', '食事・飲み物', '宿泊費', '飛行機', '娯楽費'],
        datasets: [
            {
                data: [summary.trafic, summary.food, summary.accommodation, summary.plane, summary.entertainment],
                backgroundColor: [
                    '#FF9500', // オレンジ
                    '#34C759', // グリーン
                    '#007AFF', // ブルー
                    '#FF2D55', // ピンク
                    '#AF52DE'  // パープル
                ],
                borderColor: [
                    '#FF9500',
                    '#34C759',
                    '#007AFF',
                    '#FF2D55',
                    '#AF52DE'
                ],
                borderWidth: 1,
            },
        ],
    };

    const barChartData = {
        labels: ['交通・移動', '食事・飲み物', '宿泊費', '飛行機', '娯楽費'],
        datasets: [
            {
                label: '金額',
                data: [summary.trafic, summary.food, summary.accommodation, summary.plane, summary.entertainment],
                backgroundColor: [
                    '#FF9500',
                    '#34C759',
                    '#007AFF',
                    '#FF2D55',
                    '#AF52DE'
                ],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
        },
    };

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: '項目別支出',
                font: {
                    size: 14,
                    weight: 'bold'
                },
                padding: {
                    bottom: 20
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '¥' + value.toLocaleString();
                    },
                    font: {
                        size: 12
                    }
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 12
                    }
                }
            }
        }
    };

    return (
        <div>
            <div className="summary-section">
                <div className="charts-container">
                    <div className="chart-tabs">
                        <button 
                            className={`chart-tab ${activeChart === 'pie' ? 'active' : ''}`}
                            onClick={() => setActiveChart('pie')}
                        >
                            円グラフ
                        </button>
                        <button 
                            className={`chart-tab ${activeChart === 'bar' ? 'active' : ''}`}
                            onClick={() => setActiveChart('bar')}
                        >
                            棒グラフ
                        </button>
                    </div>
                    <div className="chart-wrapper">
                        {activeChart === 'pie' ? (
                            <Pie data={chartData} options={chartOptions} />
                        ) : (
                            <Bar data={barChartData} options={barChartOptions} />
                        )}
                    </div>
                </div>
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
                <div className="summary-item">
                    <span className="summary-label">飛行機代</span>
                    <span className="summary-value">¥{summary.plane.toLocaleString()}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">娯楽費</span>
                    <span className="summary-value">¥{summary.entertainment.toLocaleString()}</span>
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