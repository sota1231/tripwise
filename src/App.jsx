import { useEffect, useState } from 'react'
import './App.css'
import Login from '../components/Login'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Top from '../components/Top'
import { auth, db } from '../firebase'
import Footer from '../components/Footer'
import Input from '../components/Input'
import Sum from '../components/Sum'
import Home from '../components/Home'
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore'

function App() {
  const [user, setUser] = useState(null);
  const [project, setProject] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
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
    await addDoc(collection(db, "project_data"), newProject); // 登録処理
  };

  // データ操作　プロジェクト削除 ===============
  const onDeleteProject = async (id) => {
    if (!window.confirm('データの復元はできません。プロジェクトを削除してよろしいですか？')) {
      return;
    }
    await deleteDoc(doc(db, "project_data", id)); // 削除処理
  };

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
            />
          } />
          <Route path="/input" element={
            <Input
              handleLogout={handleLogout} 
              user={user}
              selectedProjectId={selectedProjectId}
              />
          } />
          <Route path="/sum" element={
            <Sum
              handleLogout={handleLogout} 
              user={user}
              selectedProjectId={selectedProjectId}
              />
          } />
          {/* <Route
            path="/sum"
            element={<Navigate to="/" replace />}
          /><Route
            path="/input"
            element={<Navigate to="/" replace />}
          /> */}
          <Route path="/home" element={
            <Home
              handleLogout={handleLogout} />
          } />
        </Routes>
        <Footer />
      </BrowserRouter>

    </>
  )
}

export default App
