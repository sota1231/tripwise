import { addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { clearLocalRecords, getAllLocalRecords } from './LocalInputData';
import './List.css';

const List = ({
  handleLogout, user, onDeleteInputData, setSelectedInputData, selectedProjectRecord
}) => {

  const [inputData, setInputData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "input_data"),
      where("userId", "==", user.uid),
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
  }, [user, selectedProjectRecord]);


  const handleSelect = (data) => {
    setSelectedInputData(data);
    navigate('/update');
  };

  // 項目名を日本語に変換
  const getKindName = (kind) => {
    const kinds = {
      trafic: '交通・移動',
      food: '食事・飲み物',
      accommodation: '宿泊費'
    };
    return kinds[kind] || kind;
  };

  // ボタン押下でローカルからDBへ登録処理
  const localDataToDB = async () => {
    try {
      const records = await getAllLocalRecords();
      if (records.length === 0) return;

      const batch = records.map((record) =>
        addDoc(collection(db, 'input_data'), record)
      );
      await Promise.all(batch);
      await clearLocalRecords();
      console.log("ローカルデータをDBに登録完了");
    } catch (e) {
      console.error("ローカルデータをDBに登録完了失敗: ", e);
    }

}

return (
  <>
    <div className="button-container">
      <button className="save-button" onClick={localDataToDB}>DBに保存する</button>
    </div>
    <div className="sum-container">
      <div className="sum-table">
        <div className="table-header">
          <div className="table-row">
            <div className="table-cell kind">項目</div>
            <div className="table-cell name">品目</div>
            <div className="table-cell money">金額</div>
            <div className="table-cell memo">　　　　　　　　　</div>
          </div>
        </div>
        {inputData.map((data) => (
          <div key={data.id} className="table-row" onClick={() => handleSelect(data)}>
            <div className="table-cell kind">{getKindName(data.kind)}</div>
            <div className="table-cell name">{data.name || '名前入力なし'}</div>
            <div className="table-cell money">¥{Number(data.jpy).toLocaleString()}</div>
            <div className="table-cell memo"></div>
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteInputData(data.id);
              }}
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  </>
)
}

export default List