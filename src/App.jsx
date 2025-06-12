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
  const [selectedProjectRecord, setSelectedProjectRecord] = useState(null);
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
  const fetchData = async () => {
    try {
      const projectQuery = query(
        collection(db, "project_data"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(projectQuery);
      const projectData = [];
      querySnapshot.forEach((doc) => {
        projectData.push({ ...doc.data(), id: doc.id });
      });
      setProject(projectData);
      console.log('プロジェクトの更新完了')

      // // FXデータの取得
      // const fxQuery = query(
      //   collection(db, "select_fx"),
      //   where("userId", "==", user.uid),
      // );
      // const fxSnapshot = await getDocs(fxQuery);
      // const fx_data = [];
      // fxSnapshot.forEach((doc) => {
      //   fx_data.push({ ...doc.data(), id: doc.id });
      // });
      // console.log('FXデータ:', fx_data)

    } catch (e) {
      console.error("データの取得に失敗しました", e);
    }
  }

  useEffect(() => {
    if (!user) return;
    fetchData();
    // 🌟onSnapshotによるリアルタイム更新
    // const unsubscribe = onSnapshot(q, (querySnapshot) => {
    //   const projectData = [];
    //   querySnapshot.forEach((doc) => {
    //     projectData.push({ ...doc.data(), id: doc.id }); // idデータを追加
    //   });
    //   setProject(projectData);
    // });
    // return () => unsubscribe();
  }, [user]);

  // データ操作　プロジェクト登録 ===============
  const onAddProject = async () => {
    const newProject = {
      name: '名前を登録する　→',
      modDate: Date.now(),
      createDate: Date.now(),
      userId: user.uid,  // ユーザーIDを追加
      id: id,
      fxRates: ''
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
              setSelectedProjectRecord={setSelectedProjectRecord}
              setSelectedProjectName={setSelectedProjectName}
              fetchData={fetchData}
            />
          } />
          <Route path="/fx" element={
            <ExchangeRate
              handleLogout={handleLogout}
              onAddProject={onAddProject}
              onDeleteProject={onDeleteProject}
              setSelectedProjectRecord={setSelectedProjectRecord}
              // selectedProjectId={selectedProjectId}
              user={user}
            />
          } />
          <Route path="/input" element={
            <>
              <Header
                selectedProjectName={selectedProjectName}
              />
              <Input
                user={user}
                selectedProjectRecord={selectedProjectRecord}
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
                handleLogout={handleLogout}
                user={user}
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
                user={user}
                selectedInputData={selectedInputData}
                selectedProjectRecord={selectedProjectRecord}
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
