import { useEffect, useState } from 'react'
import './App.css'
import Login from '../components/Login'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Top from '../components/Top'
import { auth, db } from '../firebase'
import Footer from '../components/Footer'
import Input from '../components/Input'
import Sum from '../components/Sum'
import List from '../components/List'
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore'
import Header from '../components/Header'
import InputDataUpdate from '../components/InputDataUpdate'
import ExchangeRate from '../components/ExchangeRate'
import Balance from '../components/Balance'
import { getFromLocalStorage } from '../components/LocalStorageProject';
import { deleteDisplayRecord, getAllProjectRecords, saveProjectRecord, deleteProjectRecord, syncProjectRecords, getAllDisplayRecords, saveAuthSession, getAuthSession, clearAuthSession } from '../components/LocalInputData';

function App() {
  const [project, setProject] = useState([]);
  const [change, setChange] = useState(null);
  const [selectedProjectRecord, setSelectedProjectRecord] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState(null);
  const [selectedInputData, setSelectedInputData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const id = uuidv4();

  // アプリ起動時に認証状態をチェック
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getAuthSession();
        if (session && session.userId) {
          setIsAuthenticated(true);
          setCurrentUser(session);
        }
      } catch (error) {
        console.error('認証チェックエラー:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // ログイン処理
  const handleLogin = async (selectedUser, password) => {
    if (password === selectedUser.password) {
      await saveAuthSession(
        selectedUser.id,
        selectedUser.email,
        selectedUser.displayName,
        selectedUser.isVerified
      );
      setCurrentUser({
        userId: selectedUser.id,
        email: selectedUser.email,
        displayName: selectedUser.displayName,
        isVerified: selectedUser.isVerified
      });
      setIsAuthenticated(true);
    } else {
      alert('パスワードが正しくありません');
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    if (window.confirm('ログアウトしますか？')) {
      await clearAuthSession();
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  // ローカルストレージからプロジェクト親のデータを取得
  useEffect (() => {
    const record = getFromLocalStorage('selectedProjectRecord');
    const name = getFromLocalStorage('selectedProjectName');
    setSelectedProjectRecord(record);
    setSelectedProjectName(name);
  },[change])

  // IndexedDBからプロジェクト一覧を読み込む
  const loadProjects = async () => {
    try {
      const projects = await getAllProjectRecords();
      // createDateで降順ソート
      projects.sort((a, b) => (b.createDate || 0) - (a.createDate || 0));
      setProject(projects);
    } catch (error) {
      console.error('プロジェクトの読み込みに失敗:', error);
    }
  };

  // 初回読み込み
  useEffect(() => {
    loadProjects();
  }, []);

  // 今日の日付データ
  const today = new Date();
  const formatted = today.toISOString().slice(0, 10); // "YYYY-MM-DD"形式

  // データ操作　プロジェクト取得（Firestoreから同期） ===============
  const fetchData = async () => {
    try {
      const projectQuery = query(
        collection(db, "project_data"),
      );

      const querySnapshot = await getDocs(projectQuery);
      const projectData = [];
      querySnapshot.forEach((doc) => {
        projectData.push({ ...doc.data(), id: doc.id });
      });

      // Firestoreからのデータを IndexedDBに保存
      await syncProjectRecords(projectData);

      // IndexedDBから再読み込み
      await loadProjects();
      console.log('プロジェクトの更新完了')

    } catch (e) {
      console.error("データの取得に失敗しました", e);
    }
  }

  // データ操作　プロジェクト登録 ===============
  const onAddProject = async () => {
    const newProject = {
      name: '名前を登録する　→',
      modDate: formatted,
      createDate: Date.now(),
      id: id,
      fxRates: ''
    };
    console.log(id);

    // Firestoreに保存
    await setDoc(doc(db, "project_data", id), newProject);

    // IndexedDBにも保存
    await saveProjectRecord(newProject);

    // 再読み込み
    await loadProjects();
  };

  // データ操作　プロジェクト削除(紐付けデータ削除) ===============
  const onDeleteProject = async (id) => {
    if (!window.confirm('データの復元はできません。プロジェクトを削除してよろしいですか？')) {
      return;
    }

    // Firestoreから削除
    await deleteDoc(doc(db, "project_data", id)); // プロジェクト削除処理

    const q = query(collection(db, "input_data"), where("projectId", "==", id));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map((document) =>
      deleteDoc(doc(db, "input_data", document.id))
    );

    await Promise.all(deletePromises); // すべての削除が完了するまで待つ

    // IndexedDBからも削除
    await deleteProjectRecord(id);

    // IndexedDBから紐付いているinputデータも削除
    const allDisplayRecords = await getAllDisplayRecords();
    const relatedRecords = allDisplayRecords.filter(record => record.projectId === id);
    for (const record of relatedRecords) {
      await deleteDisplayRecord(record.id);
    }

    // 再読み込み
    await loadProjects();
  };

  // データ操作　インプットデータ削除 ===============
  const onDeleteInputData = async (id, isFirestoreId = true) => {
    try {
      // Firestoreから削除（idがFirestore IDの場合）
      if (isFirestoreId) {
        await deleteDoc(doc(db, "input_data", id));
      }
      // IndexedDBからも削除
      await deleteDisplayRecord(id);
      console.log('データ削除完了');
    } catch (error) {
      console.error('データ削除失敗:', error);
    }
  }

  // 認証チェック中はローディング表示
  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        読み込み中...
      </div>
    );
  }

  // 未認証の場合はログイン画面を表示
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // 認証済みの場合はアプリを表示
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Top
              onAddProject={onAddProject}
              project={project}
              onDeleteProject={onDeleteProject}
              fetchData={fetchData}
              formatted={formatted}
              setChange={setChange}
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          } />
          <Route path="/fx" element={
            <ExchangeRate
              onAddProject={onAddProject}
              onDeleteProject={onDeleteProject}
              selectedProjectRecord={selectedProjectRecord}
            />
          } />
          <Route path="/input" element={
            <>
              <Header
                selectedProjectName={selectedProjectName}
              />
              <Input
                selectedProjectRecord={selectedProjectRecord}
                formatted={formatted}
                currentUser={currentUser}
              />
              <Footer />
            </>
          } />
          <Route path="/sum" element={
            <>
              <Header
                selectedProjectName={selectedProjectName}
              />
              <Sum
                onDeleteInputData={onDeleteInputData}
                selectedProjectRecord={selectedProjectRecord}
              />
              <Footer />
            </>
          } />
          <Route path="/List" element={
            <>
              <Header
                selectedProjectName={selectedProjectName}
              />
              <List
                selectedProjectRecord={selectedProjectRecord}
                onDeleteInputData={onDeleteInputData}
                selectedInputData={selectedInputData}
                setSelectedInputData={setSelectedInputData}
              />
              <Footer />
            </>
          } />
          <Route path="/update" element={
            <>
              <Header
                selectedProjectName={selectedProjectName}
              />
              <InputDataUpdate
                selectedInputData={selectedInputData}
                selectedProjectRecord={selectedProjectRecord}
              />
              <Footer />
            </>
          } />
          <Route path="/balance" element={
            <>
              <Header
                selectedProjectName={selectedProjectName}
              />
              <Balance
                selectedProjectRecord={selectedProjectRecord}
                currentUser={currentUser}
              />
              <Footer />
            </>
          } />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
