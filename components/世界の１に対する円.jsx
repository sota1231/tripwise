import React, { useEffect, useState } from 'react';

const currencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW', 'SGD', 'INR'];

const ExchangeRateToJPY = () => {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      const newRates = {};
      for (const currency of currencies) {
        try {
          const res = await fetch(`https://api.frankfurter.app/latest?from=${currency}&to=JPY`);
          const data = await res.json();
          if (data.rates && data.rates.JPY) {
            newRates[currency] = data.rates.JPY;
          } else {
            console.error(`JPYレートが取得できませんでした:`, data);
          }
        } catch (err) {
          console.error(`エラー (${currency} → JPY):`, err.message);
        }
      }
      setRates(newRates);
      setLoading(false);
    };

    fetchRates();
  }, []);

  return (
    <div>
      <h2>各国通貨1単位 → 日本円（JPY）</h2>
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <ul>
          {Object.entries(rates).map(([currency, rate]) => (
            <li key={currency}>
              1 {currency} = {rate} JPY
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExchangeRateToJPY;
