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

function App() {
  const [user, setUser] = useState(null);
  const [project, setProject] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState(null);
  const [selectedInputData, setSelectedInputData] = useState(null);
  const id = uuidv4();

  // 認証状態の監視 =================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);
  // ログアウト機能
  const handleLogout = () => {
    auth.signOut();
  };

  // データ操作　プロジェクト取得 ===============
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "project_data"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectData = [];
      querySnapshot.forEach((doc) => {
        projectData.push({ ...doc.data(), id: doc.id }); // idデータを追加
      });
      setProject(projectData);
    });
    return () => unsubscribe();
  }, [user]);

  // データ操作　プロジェクト登録 ===============
  const onAddProject = async () => {
    const newProject = {
      name: 'test',
      modDate: Date.now(),
      createDate: Date.now(),
      userId: user.uid,  // ユーザーIDを追加
      id: id
    };
    console.log(id);
    await setDoc(doc(db, "project_data", id), newProject); // 登録処理
  };

  // データ操作　プロジェクト削除(紐付けデータ削除) ===============
  const onDeleteProject = async (id) => {
    if (!window.confirm('データの復元はできません。プロジェクトを削除してよろしいですか？')) {
      return;
    }
    await deleteDoc(doc(db, "project_data", id)); // プロジェクト削除処理

    const q = query(collection(db, "input_data"), where("projectId", "==", id));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map((document) =>
      deleteDoc(doc(db, "input_data", document.id))
    );

    await Promise.all(deletePromises); // すべての削除が完了するまで待つ
  };

  // データ操作　インプットデータ削除 ===============
  const onDeleteInputData = async (id) => {
    await deleteDoc(doc(db, "input_data", id)); // プロジェクト削除処理
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Top
              handleLogout={handleLogout}
              onAddProject={onAddProject}
              project={project}
              onDeleteProject={onDeleteProject}
              setSelectedProjectId={setSelectedProjectId}
              setSelectedProjectName={setSelectedProjectName}
            />
          } />
          <Route path="/fx" element={
            <ExchangeRate
              handleLogout={handleLogout}
              onAddProject={onAddProject}
              onDeleteProject={onDeleteProject}
              setSelectedProjectId={setSelectedProjectId}
              selectedProjectId={selectedProjectId}
              user={user}
            />
          } />
          <Route path="/input" element={
            <>
              <Header
                selectedProjectName={selectedProjectName}
              />
              <Input
                handleLogout={handleLogout}
                user={user}
                selectedProjectId={selectedProjectId}
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
                handleLogout={handleLogout}
                user={user}
                selectedProjectId={selectedProjectId}
                onDeleteInputData={onDeleteInputData}
                setSelectedInputData={setSelectedInputData}
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
                handleLogout={handleLogout}
                user={user}
                selectedProjectId={selectedProjectId}
                onDeleteInputData={onDeleteInputData}
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
                user={user}
                selectedInputData={selectedInputData}
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
