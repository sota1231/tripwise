import { openDB } from 'idb';

const DB_NAME = 'input_data';
const STORE_NAME = 'input_data_records';

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
export const addLocalRecord = async (record) => {
  const db = await initDB();
  await db.add(STORE_NAME, record);
};

// ローカルDBに保存された全レコードを取得
export const getAllLocalRecords = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

// ローカルDB内の全レコードを削除
export const clearLocalRecords = async () => {
  const db = await initDB();
  return db.clear(STORE_NAME);
};