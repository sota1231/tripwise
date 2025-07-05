import { openDB } from 'idb';

const DB_NAME = 'project_data';
const STORE_NAME = 'project_data_records';

export const initDB = async () => {
  return openDB(DB_NAME, 1, { // 1はバージョン
    upgrade(db) { // upgradeは初期化、更新するときに呼ばれる関数
      if (!db.objectStoreNames.contains(STORE_NAME)) { // STORE_NAMEがなければ作成する
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

// レコードをローカルDBに追加
export const addLocalProjectRecord = async (record) => {
  const db = await initDB();
  await db.put(STORE_NAME, record);
};

// ローカルDBに保存された全レコードを取得
export const getAllLocaProjectlRecords = async () => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

// ローカルDB内の全レコードを削除
export const clearLocalProjectRecords = async () => {
  const db = await initDB();
  await db.clear(STORE_NAME);
  let a = await getAllLocaProjectlRecords();
  console.log('aaaaadata: '+a)
  return 
};