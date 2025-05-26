import { addDoc, collection } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../firebase';
import { useNavigate, useParams } from 'react-router-dom';

const Input = ({ user, selectedProjectId }) => {

    console.log(selectedProjectId);
    const navigate = useNavigate();

    useEffect(() => {
        if (!selectedProjectId) {
            navigate("/");
        }

    }, [selectedProjectId, navigate])

    const [form, setForm] = useState({
        kind: '',
        name: '',
        money: '',
        memo: '',
    });
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // データ操作　プロジェクト登録 ===============
    const onAddItem = async (e) => {
        e.preventDefault(); // ←重要: フォーム送信時のリロードを防ぐ

        const newItem = {
            kind: form.kind,
            name: form.name,
            money: form.money,
            memo: form.memo,
            modDate: Date.now(),
            createDate: Date.now(),
            userId: user.uid,
            projectId: selectedProjectId,
        };

        try {
            await addDoc(collection(db, 'input_data'), newItem);
            console.log('登録成功:', newItem);
            setForm({
                kind: '',
                name: '',
                money: '',
                memo: ''
            })
        } catch (error) {
            console.error('登録失敗:', error);
        }
    };


    return (
        <>
            <div>Input</div>
            <form onSubmit={onAddItem}>
                <div>
                    <span>項目:</span>
                    <select name='kind' onChange={handleChange} >
                        <option value="">----</option>
                        <option value="trafic">交通・移動</option>
                        <option value="food">食事・飲み物</option>
                        <option value="accommodation">宿泊費</option>
                    </select>
                </div>
                <div>
                    <span>品目:</span>
                    <input type='text' name='name' value={form.name} onChange={handleChange} />
                </div>
                <div>
                    <span>金額:</span>
                    <input type='text' name='money' value={form.money} onChange={handleChange} />
                </div>
                <div>
                    <span>メモ:</span>
                    <input type='text' name='memo' value={form.memo} onChange={handleChange} />
                </div>
                <button type='submit'>登録</button>
            </form>
        </>
    )
}

export default Input