import { addDoc, collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { clearLocalRecords, getAllLocalRecords, getLocalRecordsCount, getAllDisplayRecords, syncDisplayRecordsByProject, deleteDisplayRecord } from './LocalInputData';
import './List.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrain, faUtensils, faHotel, faPlane, faHotTub } from '@fortawesome/free-solid-svg-icons';

const List = ({
  onDeleteInputData, setSelectedInputData, selectedProjectRecord
}) => {

  const [inputData, setInputData] = useState([]);
  const [localRecordsCount, setLocalRecordsCount] = useState(0);
  const navigate = useNavigate();

  // IndexedDBから表示用データを読み込む
  const loadDisplayData = async () => {
    try {
      const records = await getAllDisplayRecords();
      // プロジェクトIDでフィルタリング
      const filteredRecords = records.filter(
        record => record.projectId === selectedProjectRecord.id
      );
      // 日付の降順でソート
      filteredRecords.sort((a, b) => {
        const dateA = new Date(a.modDate);
        const dateB = new Date(b.modDate);
        return dateB - dateA;
      });
      setInputData(filteredRecords);
    } catch (error) {
      console.error('表示データの読み込みに失敗:', error);
    }
  };

  useEffect(() => {
    loadDisplayData();

    // 定期的にデータを更新（5秒ごと）
    const interval = setInterval(loadDisplayData, 5000);

    return () => clearInterval(interval);
  }, [selectedProjectRecord]);

  // indexedDBの件数を取得
  useEffect(() => {
    const fetchLocalRecordsCount = async () => {
      try {
        const count = await getLocalRecordsCount();
        setLocalRecordsCount(count);
      } catch (error) {
        console.error('ローカルレコード数の取得に失敗:', error);
      }
    };

    fetchLocalRecordsCount();

    // ページがフォーカスされた時にも件数を更新
    const handleFocus = () => {
      fetchLocalRecordsCount();
    };

    window.addEventListener('focus', handleFocus);
    
    // 定期的に件数を更新（5秒ごと）
    const interval = setInterval(fetchLocalRecordsCount, 5000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const handleSelect = (data) => {
    setSelectedInputData(data);
    navigate('/update');
  };

  // 項目名をアイコンに変換
  const getKindIcon = (kind) => {
    const icons = {
      trafic: <FontAwesomeIcon icon={faTrain} className="kind-icon" />,
      food: <FontAwesomeIcon icon={faUtensils} className="kind-icon" />,
      accommodation: <FontAwesomeIcon icon={faHotel} className="kind-icon" />,
      plane: <FontAwesomeIcon icon={faPlane} className="kind-icon" />,
      entertainment: <FontAwesomeIcon icon={faHotTub} className="kind-icon" />
    };
    return icons[kind] || kind;
  };

  // 日付でデータをグループ化
  const groupDataByDate = (data) => {
    const grouped = {};
    data.forEach(item => {
      const date = new Date(item.modDate?.toDate ? item.modDate.toDate() : item.modDate);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD形式
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    return grouped;
  };

  // 日付を日本語形式で表示
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
      return '今日';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return '昨日';
    } else {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    }
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
      setLocalRecordsCount(0); // 件数を0にリセット
      console.log("ローカルデータをDBに登録完了");

      // DB送信後、Firestoreから表示用データを同期
      await syncFromFirestore();
    } catch (e) {
      console.error("ローカルデータをDBに登録完了失敗: ", e);
    }
  };

  // Firestoreから表示用ストアに同期
  const syncFromFirestore = async () => {
    try {
      const q = query(
        collection(db, "input_data"),
        where("projectId", "==", selectedProjectRecord.id)
      );
      const querySnapshot = await getDocs(q);
      const firestoreData = [];
      querySnapshot.forEach((doc) => {
        firestoreData.push({ ...doc.data(), id: doc.id, firestoreId: doc.id });
      });

      // プロジェクト単位で同期（他のプロジェクトのデータは保持される）
      await syncDisplayRecordsByProject(selectedProjectRecord.id, firestoreData);
      await loadDisplayData();
      console.log("Firestoreから同期完了");
    } catch (e) {
      console.error("Firestore同期失敗: ", e);
    }
  };

return (
  <>
    <div className="button-container">
      <button className="save-button" onClick={localDataToDB}>DBに保存する（{localRecordsCount}件）</button>
      <button className="save-button" onClick={syncFromFirestore}>DBから更新</button>
    </div>
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
        {Object.entries(groupDataByDate(inputData))
          .sort(([a], [b]) => b.localeCompare(a)) // 日付の降順でソート
          .map(([dateKey, items]) => (
            <React.Fragment key={dateKey}>
              <div className="date-header">
                {formatDate(dateKey)}
              </div>
              {items.map((data) => {
                const people = data.people || 1;
                const perPersonAmount = Math.round(Number(data.jpy) / people);
                return (
                  <div key={data.id} className="table-row" onClick={() => handleSelect(data)}>
                    <div className="table-cell kind">{getKindIcon(data.kind)}</div>
                    <div className="table-cell name">{data.name || '名前入力なし'}</div>
                    <div className="table-cell money">¥{perPersonAmount.toLocaleString()}</div>
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
                );
              })}
            </React.Fragment>
          ))}
      </div>
    </div>
  </>
)
}

export default List