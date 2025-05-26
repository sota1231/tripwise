import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase';

const Sum = ({ user, selectedProjectId }) => {

    // console.log(selectedProjectId);
    const [inputData, setInputData] = useState([]);

    // データ操作　入力データ取得 ===============
    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "input_data"),
            where("userId", "==", user.uid),
            where("projectId", "==", selectedProjectId)
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const input_data = [];
            querySnapshot.forEach((doc) => {
                input_data.push({ ...doc.data(), id: doc.id }); // idデータを追加
            });
            setInputData(input_data);
        });
        return () => unsubscribe();
    }, [user]);

    return (
        <>
            <div>Sum</div>

            {inputData.map((data) => (
                <div
                    key={data.id}
                >
                    <div className='title_deleteButton'>
                        <div className='wordlist-note-title'>
                            <Link to="/sum" onClick={() => handleSelect(data.id)}>{data.name ? data.name : '名前入力なし'}</Link>
                            <button onClick={() => onDeleteProject(data.id)}>削除</button>
                        </div>
                    </div>
                </div>
            ))}</>
    )
}

export default Sum