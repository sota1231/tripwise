import React, { useEffect, useState } from 'react';
import { addDoc, collection, limit, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';


const currencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW', 'SGD', 'INR', 'MYR', 'THB'];
const currencyList = [
  { code: 'USD', country: 'アメリカ' },
  { code: 'EUR', country: 'ユーロ圏' },
  { code: 'GBP', country: 'イギリス' },
  { code: 'AUD', country: 'オーストラリア' },
  { code: 'CAD', country: 'カナダ' },
  { code: 'CHF', country: 'スイス' },
  { code: 'CNY', country: '中国' },
  { code: 'KRW', country: '韓国' },
  { code: 'SGD', country: 'シンガポール' },
  { code: 'INR', country: 'インド' },
  { code: 'MYR', country: 'マレーシア' },
  { code: 'THB', country: 'タイ' },
];

const ExchangeRateToJPY = ({ selectedProjectId, user }) => {
  const userId = user.uid;
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCurrencies, setSelectedCurrencies] = useState([]);

  // プロジェクトID、userIdと一致している為替データがある場合はsumに飛ばす
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "select_fx"),
      where("selectedProjectId", "==", selectedProjectId),
      where("userId", "==", user.uid),
      limit(1)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        navigate("/sum");
      }
    });

    return () => unsubscribe();
  }, [user, selectedProjectId]);

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

  // 登録ボタン押下時の処理
  const handleSubmit = async () => {
    const selectedData = selectedCurrencies.map(code => {
      const rate = rates[code];
      const country = currencyList.find(c => c.code === code)?.country || '';
      return { code, country, rate, userId, selectedProjectId };
    });

    try {
      const collectionRef = collection(db, 'select_fx');
      for (const item of selectedData) {
        await addDoc(collectionRef, item);
      }
      alert('通貨情報を保存しました');
    } catch (err) {
      console.error('保存エラー:', err);
      alert('保存に失敗しました');
    }
  };


  return (
    <div>
      <h2>各国通貨1単位 → 日本円（JPY）</h2>
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <>
          <ul>
            {Object.entries(rates).map(([currency, rate]) => {
              const country = currencyList.find(c => c.code === currency)?.country || '';
              return (
                <li key={currency}>
                  <label>
                    <input
                      type='checkbox'
                      checked={selectedCurrencies.includes(currency)}
                      onChange={() => handleCheckboxChange(currency)}
                    />
                    {country}（{currency}）: 1 {currency} = {rate} JPY
                  </label>
                </li>
              );
            })}
          </ul>
          <Link to="/sum">
            <button type='button' onClick={handleSubmit}>
              登録する
            </button>
          </Link>
        </>
      )}
    </div>
  );
};

export default ExchangeRateToJPY;
