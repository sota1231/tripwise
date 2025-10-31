import { openDB } from 'idb';

const DB_NAME = 'input_data';
const STORE_NAME = 'input_data_records'; // DB送信待ちデータ
const DISPLAY_STORE_NAME = 'display_data'; // 表示用データ
const PROJECT_STORE_NAME = 'project_data'; // プロジェクトデータ

export const initDB = async () => {
  return openDB(DB_NAME, 3, { // バージョンを3に上げる
    upgrade(db) { // upgradeは初期化、更新するときに呼ばれる関数
      if (!db.objectStoreNames.contains(STORE_NAME)) { // STORE_NAMEがなければ作成する
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(DISPLAY_STORE_NAME)) { // 表示用ストアを作成
        db.createObjectStore(DISPLAY_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(PROJECT_STORE_NAME)) { // プロジェクト用ストアを作成
        db.createObjectStore(PROJECT_STORE_NAME, { keyPath: 'id' });
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

// ローカルDB内のレコード数を取得
export const getLocalRecordsCount = async () => {
  const db = await initDB();
  return db.count(STORE_NAME);
};

// ==== 表示用データの操作 ====

// 表示用ストアにレコードを追加
export const addDisplayRecord = async (record) => {
  const db = await initDB();
  await db.add(DISPLAY_STORE_NAME, record);
};

// 表示用ストアから全レコードを取得
export const getAllDisplayRecords = async () => {
  const db = await initDB();
  return db.getAll(DISPLAY_STORE_NAME);
};

// 表示用ストアのレコードを更新
export const updateDisplayRecord = async (id, record) => {
  const db = await initDB();
  await db.put(DISPLAY_STORE_NAME, { ...record, id });
};

// 表示用ストアからレコードを削除
export const deleteDisplayRecord = async (id) => {
  const db = await initDB();
  await db.delete(DISPLAY_STORE_NAME, id);
};

// 表示用ストアを全削除
export const clearDisplayRecords = async () => {
  const db = await initDB();
  await db.clear(DISPLAY_STORE_NAME);
};

// Firestoreデータを表示用ストアに同期（全削除してから追加）
export const syncDisplayRecords = async (records) => {
  const db = await initDB();
  await db.clear(DISPLAY_STORE_NAME);

  for (const record of records) {
    await db.add(DISPLAY_STORE_NAME, record);
  }
};

// プロジェクト単位でFirestoreデータを同期（指定プロジェクトのみ削除して追加）
export const syncDisplayRecordsByProject = async (projectId, records) => {
  const db = await initDB();

  // 現在の全データを取得
  const allRecords = await db.getAll(DISPLAY_STORE_NAME);

  // 指定されたプロジェクト以外のデータを抽出
  const otherProjectRecords = allRecords.filter(record => record.projectId !== projectId);

  // 表示用ストアを全削除
  await db.clear(DISPLAY_STORE_NAME);

  // 他のプロジェクトのデータを戻す
  for (const record of otherProjectRecords) {
    await db.add(DISPLAY_STORE_NAME, record);
  }

  // 新しいデータを追加
  for (const record of records) {
    await db.add(DISPLAY_STORE_NAME, record);
  }
};

// ==== プロジェクトデータの操作 ====

// プロジェクトを追加または更新
export const saveProjectRecord = async (project) => {
  const db = await initDB();
  await db.put(PROJECT_STORE_NAME, project);
};

// 全プロジェクトを取得
export const getAllProjectRecords = async () => {
  const db = await initDB();
  return db.getAll(PROJECT_STORE_NAME);
};

// プロジェクトを削除
export const deleteProjectRecord = async (id) => {
  const db = await initDB();
  await db.delete(PROJECT_STORE_NAME, id);
};

// Firestoreからプロジェクトデータを同期
export const syncProjectRecords = async (projects) => {
  const db = await initDB();
  await db.clear(PROJECT_STORE_NAME);

  for (const project of projects) {
    await db.put(PROJECT_STORE_NAME, project);
  }
};