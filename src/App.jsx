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
import { getFromLocalStorage } from '../components/LocalStorageProject';

function App() {
  const [project, setProject] = useState([]);
  const [change, setChange] = useState(null);
  const [selectedProjectRecord, setSelectedProjectRecord] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState(null);
  const [selectedInputData, setSelectedInputData] = useState(null);
  const id = uuidv4();

  // ローカルストレージからプロジェクト親のデータを取得
  useEffect (() => {
    const record = getFromLocalStorage('selectedProjectRecord');
    const name = getFromLocalStorage('selectedProjectName');
    setSelectedProjectRecord(record);
    setSelectedProjectName(name);
  },[change])

  // 今日の日付データ
  const today = new Date();
  const formatted = today.toISOString().slice(0, 10); // "YYYY-MM-DD"形式

  // データ操作　プロジェクト取得 ===============
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
      setProject(projectData);
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
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
