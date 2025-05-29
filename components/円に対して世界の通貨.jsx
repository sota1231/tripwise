import React, { useEffect, useState } from 'react';

const ExchangeRate = () => {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.frankfurter.app/latest?from=JPY')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setRates(data.rates);
        } else {
          console.error("APIレスポンスにレートが含まれていません:", data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("為替データの取得に失敗:", err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>USD → 各国通貨 為替レート</h2>
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <ul>
          {Object.entries(rates).map(([currency, rate]) => (
            <li key={currency}>
              1 USD = {rate} {currency}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExchangeRate;
