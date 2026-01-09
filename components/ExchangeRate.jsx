import React, { useEffect, useState } from 'react';
import { addDoc, collection, doc, limit, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import './ExchangeRate.css';
import { saveProjectRecord } from './LocalInputData';


const currencies = ['USD', 'EUR', 'GBP', 'AUD', 'INR', 'THB','CHF', 'CNY', 'KRW', 'CAD', 'SGD', 'MYR', 'IDR', ];
const currencyList = [
  { code: 'USD', country: 'アメリカ' },
  { code: 'EUR', country: 'ユーロ圏' },
  { code: 'GBP', country: 'イギリス' },
  { code: 'AUD', country: 'オーストラリア' },
  { code: 'THB', country: 'タイ' },
  { code: 'CAD', country: 'カナダ' },
  { code: 'CHF', country: 'スイス' },
  { code: 'CNY', country: '中国' },
  { code: 'KRW', country: '韓国' },
  { code: 'SGD', country: 'シンガポール' },
  { code: 'INR', country: 'インド' },
  { code: 'MYR', country: 'マレーシア' },
  { code: 'IDR', country: 'インドネシア' },
];

const ExchangeRateToJPY = ({ selectedProjectRecord, updateSelectedProjectRecord}) => {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCurrencies, setSelectedCurrencies] = useState([]);
  const navigate = useNavigate();

  // 戻るボタンの処理
  const handleBack = () => {
    navigate(-1);
  };

  // 為替API発火
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const promises = currencies.map(currency =>
          fetch(`https://api.frankfurter.app/latest?from=${currency}&to=JPY`)
            .then(res => res.json())
            .then(data => ({
              currency,
              rate: data.rates?.JPY ?? null
            }))
        );

        const results = await Promise.all(promises);
        const newRates = {};
        results.forEach(({ currency, rate }) => {
          if (rate !== null) {
            newRates[currency] = rate;
          }
        });
        setRates(newRates);
      } catch (err) {
        console.error('全体的なエラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  // チェックボックスの変更処理
  const handleCheckboxChange = (currency) => {
    setSelectedCurrencies((prevSelected) =>
      prevSelected.includes(currency)
        ? prevSelected.filter((c) => c !== currency)
        : [...prevSelected, currency]
    );
  };

  const handleSubmit = async () => {
    if (selectedCurrencies.length === 0) {
      alert("通貨を選択してください");
      return;
    }

    const selectedFxRates = selectedCurrencies.reduce((acc, code) => {
      acc[code] = rates[code];
      return acc;
    }, {});

    try {
      // Firestoreを更新
      const projectDocRef = doc(db, "project_data", selectedProjectRecord.id);
      await updateDoc(projectDocRef, {
        fxRates: selectedFxRates
      });

      // IndexedDBも更新
      const updatedProject = { ...selectedProjectRecord, fxRates: selectedFxRates };
      await saveProjectRecord(updatedProject);

      // Reactの状態とローカルストレージも更新
      updateSelectedProjectRecord(updatedProject);

      alert("為替情報をプロジェクトに保存しました");
      navigate('/input');

    } catch (err) {
      console.error("保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="exchange-rate-container">
      <h2 className="exchange-rate-title">各国通貨1単位 → 日本円（JPY）</h2>
      {loading ? (
        <p className="loading-message">読み込み中...</p>
      ) : (
        <>
          <ul className="currency-list">
            {Object.entries(rates).map(([currency, rate]) => {
              const country = currencyList.find(c => c.code === currency)?.country || '';
              return (
                <li key={currency} className={`currency-item currency-${currency}`}>
                  <label className="currency-label">
                    <input
                      type='checkbox'
                      className="currency-checkbox"
                      checked={selectedCurrencies.includes(currency)}
                      onChange={() => handleCheckboxChange(currency)}
                    />
                    <div className="currency-info">
                      <div className="currency-name">
                        {country} <span className="currency-code">({currency})</span>
                      </div>
                      <div className="currency-rate">
                        1 {currency} = ¥{rate.toFixed(2)}
                      </div>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="button-container">
            <button onClick={handleBack} className="back-button">
              戻る
            </button>
            <button className="submit-button" onClick={
              async () => {
                await handleSubmit();
              }}>
              登録する
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExchangeRateToJPY;
