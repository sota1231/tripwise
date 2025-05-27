import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import './InputDataUpdate.css';

const InputDataUpdate = ({ user, selectedInputData }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        modDate: '',
        kind: '',
        name: '',
        money: '',
        memo: '',
    });

    useEffect(() => {
        if (!selectedInputData) {
            navigate('/sum');
            return;
        }

        setForm({
            modDate: selectedInputData.modDate || '',
            kind: selectedInputData.kind || '',
            name: selectedInputData.name || '',
            money: selectedInputData.money || '',
            memo: selectedInputData.memo || '',
        });
    }, [selectedInputData, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const onUpdateItem = async (e) => {
        e.preventDefault();

        if (!selectedInputData?.id) {
            console.error('更新対象のデータがありません');
            return;
        }

        const updatedItem = {
            modDate: form.modDate,
            kind: form.kind,
            name: form.name,
            money: form.money,
            memo: form.memo,
        };

        try {
            await updateDoc(doc(db, 'input_data', selectedInputData.id), updatedItem);
            console.log('更新成功:', updatedItem);
            navigate('/sum');
        } catch (error) {
            console.error('更新失敗:', error);
        }
    };

    return (
        <div className="update-container">
            <form onSubmit={onUpdateItem} className="update-form">
                <div className="form-group">
                    <label className="form-label">日付</label>
                    <input 
                        type="date" 
                        name="modDate" 
                        value={form.modDate} 
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
                
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

                <div className="button-group">
                    <button 
                        type="button" 
                        className="cancel-button"
                        onClick={() => navigate('/sum')}
                    >
                        キャンセル
                    </button>
                    <button type="submit" className="update-button">
                        更新
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InputDataUpdate;