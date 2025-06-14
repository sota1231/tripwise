import { addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import './Input.css';
import useOnlineStatus from './useOnlineStatus';
import { getAllLocalRecords, clearLocalRecords, addLocalRecord } from './LocalInputData';

const Input = ({ user, selectedProjectRecord, formatted }) => {

    const navigate = useNavigate();
    const [selectFx, setSelectFx] = useState('JPY'); // 選択通貨を保持 入力欄制御
    const [selectFxRate, setSelectFxRate] = useState(null); // 選択通貨のレートを保持
    const isOnline = useOnlineStatus(); // オンライン状況

    // プロジェクト未選択の場合TOPに遷移
    useEffect(() => {
        if (!selectedProjectRecord) {
            navigate("/");
        }

    }, [selectedProjectRecord, navigate])

    // formの準備
    const [form, setForm] = useState({
        modDate: formatted,
        kind: '',
        name: '',
        coin: '',
        rate: '',
        jpy: '',
        fx: '',
        memo: '',
    });

    // onChangeでformの値を変更
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // JPY以外で
    useEffect(() => {
        if (selectFx !== 'JPY' && form.fx && selectFxRate) {
            const calculatedJPY = Number(form.fx) * Number(selectFxRate);
            setForm((prev) => ({
                ...prev,
                jpy: calculatedJPY.toFixed(0), // 小数点切り捨て or toFixed(2)など好みで
            }));
        }
    }, [form.fx, selectFxRate, selectFx]);

    // onChangeでselectFxの値を変更,入力欄制御
    const handleFXChange = (event) => {
        const selected = event.target.value;
        const rate = event.target.selectedOptions[0].getAttribute('data-rate');
        console.log('coin:' + selected)
        console.log('rate:' + rate)
        setSelectFxRate(rate);
        setSelectFx(selected);
    };

    // データ操作　プロジェクト登録 ===============
    const onAddItem = async (e) => {
        e.preventDefault(); // ←重要: フォーム送信時のリロードを防ぐ

        const newItem = {
            kind: form.kind,
            name: form.name,
            coin: selectFx,
            rate: selectFxRate,
            jpy: form.jpy,
            fx: form.fx,
            memo: form.memo,
            modDate: form.modDate,
            userId: user.uid,
            projectId: selectedProjectRecord.id,
        };

        try {

            await addLocalRecord(newItem);
            console.log('ローカル保存完了')
            // await addDoc(collection(db, 'input_data'), newItem);
            setForm((prev) => ({
                modDate: prev.modDate,
                kind: '',
                name: '',
                coin: 'JPY',
                rate: '',
                jpy: '',
                fx: '',
                memo: ''
            }))
            setSelectFx('JPY')
            setSelectFxRate(null)
        } catch (error) {
            console.error('登録失敗:', error);
        }
    };

    return (
        <div className="input-container">
            <form onSubmit={onAddItem} className="input-form">
                <div className="form-group">
                    <label className="form-label">日付</label>
                    <input
                        type="date"
                        name="modDate"
                        value={form.modDate}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">項目</label>
                    <select
                        name="kind"
                        onChange={handleChange}
                        value={form.kind}
                        className="form-select"
                        required
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
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">通貨を選択</label>
                    <select
                        name="coin"
                        onChange={handleFXChange}
                        className="form-select"
                        value={selectFx}
                    >
                        <option value="JPY">JPY</option>

                        {selectedProjectRecord.fxRates &&
                            Object.entries(selectedProjectRecord.fxRates).map(([key, value]) => (
                                <option key={key} value={key} data-rate={value}>
                                    {key}
                                </option>
                            ))}
                    </select>

                </div>


                <div className="form-group">
                    {selectFx !== 'JPY' ? (
                        <div className="form-group">
                            <label className="form-label">海外金額({selectFx})</label>
                            <input
                                type="number"
                                name="fx"
                                value={form.fx}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="金額を入力"
                            />
                        </div>

                    ) : ('')}
                    <label className="form-label">金額(日本円){selectFx !== "JPY" && (
                        <> ※自動計算されるため入力できません</>
                    )}</label>

                    <input
                        type="number"
                        name="jpy"
                        value={form.jpy}
                        onChange={handleChange}
                        className="form-input"
                        placeholder={selectFx !== "JPY" ? '自動計算　入力不可！' : ''}
                        readOnly={selectFx !== "JPY"}
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