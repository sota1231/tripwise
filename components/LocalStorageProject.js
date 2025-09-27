// ローカルストレージ用のユーティリティ関数

// ローカルストレージに保存
export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('ローカルストレージへの保存に失敗:', error);
  }
};

// ローカルストレージから取得
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('ローカルストレージからの取得に失敗:', error);
    return defaultValue;
  }
};

// ローカルストレージから削除
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('ローカルストレージからの削除に失敗:', error);
  }
};

// 選択されたプロジェクトの保存
export const saveSelectedProject = (projectRecord, projectName) => {
  saveToLocalStorage('selectedProjectRecord', projectRecord);
  saveToLocalStorage('selectedProjectName', projectName);
};

// 選択されたプロジェクトの取得
export const getSelectedProject = () => {
  const projectRecord = getFromLocalStorage('selectedProjectRecord');
  const projectName = getFromLocalStorage('selectedProjectName');
  return { projectRecord, projectName };
};

// 選択されたプロジェクトのクリア
export const clearSelectedProject = () => {
  removeFromLocalStorage('selectedProjectRecord');
  removeFromLocalStorage('selectedProjectName');
};
