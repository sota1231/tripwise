import { openDB } from 'idb';

const DB_NAME = 'input_data';
const STORE_NAME = 'input_data_records'; // DB送信待ちデータ
const DISPLAY_STORE_NAME = 'display_data'; // 表示用データ
const PROJECT_STORE_NAME = 'project_data'; // プロジェクトデータ
const AUTH_STORE_NAME = 'auth_data'; // 認証データ

export const initDB = async () => {
  return openDB(DB_NAME, 4, { // バージョンを4に上げる
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
      if (!db.objectStoreNames.contains(AUTH_STORE_NAME)) { // 認証用ストアを作成
        db.createObjectStore(AUTH_STORE_NAME, { keyPath: 'key' });
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
// ここではローカルストレージの操作のみ
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
    await db.put(DISPLAY_STORE_NAME, record);
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

// ==== 認証データの操作 ====

// 認証情報を保存
export const saveAuthSession = async (userId, email, displayName, isVerified) => {
  const db = await initDB();
  await db.put(AUTH_STORE_NAME, {
    key: 'session',
    userId,
    email,
    displayName,
    isVerified,
    loginTime: Date.now()
  });
};

// 認証情報を取得
export const getAuthSession = async () => {
  const db = await initDB();
  return db.get(AUTH_STORE_NAME, 'session');
};

// 認証情報を削除（ログアウト）
export const clearAuthSession = async () => {
  const db = await initDB();
  await db.delete(AUTH_STORE_NAME, 'session');
};

// 支払い完了情報を保存
export const savePaymentComplete = async (projectId, completedBy, completedDate) => {
  const db = await initDB();
  const key = `payment_${projectId}`;

  // 既存の支払い完了情報を取得
  const existing = await db.get(AUTH_STORE_NAME, key);
  // 古い形式のデータ（payments配列がない場合）も考慮して安全に配列を取得
  const payments = (existing && Array.isArray(existing.payments)) ? existing.payments : [];

  // 同じユーザーの記録があれば更新、なければ追加
  const existingIndex = payments.findIndex(p => p.completedBy === completedBy);
  const newPayment = {
    completedBy,
    completedDate,
    completedTime: Date.now()
  };

  if (existingIndex >= 0) {
    payments[existingIndex] = newPayment;
  } else {
    payments.push(newPayment);
  }

  await db.put(AUTH_STORE_NAME, {
    key,
    projectId,
    payments
  });
};

// 支払い完了情報を取得
export const getPaymentComplete = async (projectId) => {
  const db = await initDB();
  return db.get(AUTH_STORE_NAME, `payment_${projectId}`);
};

// 支払い完了情報を削除
export const clearPaymentComplete = async (projectId) => {
  const db = await initDB();
  await db.delete(AUTH_STORE_NAME, `payment_${projectId}`);
};

// プロジェクトの認証済みユーザーを追加
export const addVerifiedUserToProject = async (projectId, userName) => {
  const db = await initDB();
  const key = `verified_users_${projectId}`;

  // 既存のユーザーリストを取得
  const existing = await db.get(AUTH_STORE_NAME, key);
  const users = existing ? existing.users : [];

  // 重複を避けて追加
  if (!users.includes(userName)) {
    users.push(userName);
  }

  await db.put(AUTH_STORE_NAME, {
    key,
    projectId,
    users,
    updatedTime: Date.now()
  });
};

// プロジェクトの認証済みユーザーを取得
export const getVerifiedUsersForProject = async (projectId) => {
  const db = await initDB();
  const key = `verified_users_${projectId}`;
  const result = await db.get(AUTH_STORE_NAME, key);
  return result ? result.users : [];
};