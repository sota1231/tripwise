import { addDoc, collection } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import './Input.css';


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
        <div className="input-container">
            <form onSubmit={onAddItem} className="input-form">
                <div className="form-group">
                    <label className="form-label">項目</label>
                    <select 
                        name="kind" 
                        onChange={handleChange}
                        value={form.kind}
                        className="form-select"
                    >
                        <option value="">選択してください</option>
                        <option value="trafic">交通・移動</option>
                        <option value="food">食事・飲み物</option>
                        <option value="accommodation">宿泊費</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">品目</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={form.name} 
                        onChange={handleChange}
                        className="form-input"
                        placeholder="品目を入力"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">金額</label>
                    <input 
                        type="number" 
                        name="money" 
                        value={form.money} 
                        onChange={handleChange}
                        className="form-input"
                        placeholder="金額を入力"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">メモ</label>
                    <input 
                        type="text" 
                        name="memo" 
                        value={form.memo} 
                        onChange={handleChange}
                        className="form-input"
                        placeholder="メモを入力"
                    />
                </div>

                <button type="submit" className="submit-button">
                    登録
                </button>
            </form>
        </div>
    )
}

export default Input