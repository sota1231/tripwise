import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import './InputDataUpdate.css';


const InputDataUpdate = ({ user, selectedInputData, selectedProjectRecord, project
    // , selectFx, setSelectFx, selectFxRate, setSelectFxRate 
}) => {
    const navigate = useNavigate();
    const [listFx, setListFx] = useState(null); // 為替情報取得・保存
    const [selectFx, setSelectFx] = useState(selectedInputData.coin); // 為替情報取得・保存
    const [selectFxRate, setSelectFxRate] = useState(selectedInputData.rate); // 選択通貨のレートを保持
    const [form, setForm] = useState({
        modDate: '',
        kind: '',
        name: '',
        coin: '',
        rate: '',
        jpy: '',
        fx: '',
        memo: '',
    });


    useEffect(() => {
        if (!selectedInputData) {
            navigate('/list');
            return;
        }

        setForm({
            modDate: selectedInputData.modDate || '',
            kind: selectedInputData.kind || '',
            name: selectedInputData.name || '',
            coin: selectedInputData.coin || '',
            rate: selectedInputData.rate || '',
            jpy: selectedInputData.jpy || '',
            fx: selectedInputData.fx || '',
            memo: selectedInputData.memo || '',
        });
    }, [selectedInputData, navigate]);

    // 入力データをformに入れる
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // JPY以外で
    useEffect(() => {
        console.log('selectFxRate1: ' + selectFxRate)
        console.log('selectFxRate1: ' + form.coin)
        if (form.coin !== 'JPY' && selectFxRate) {
            console.log('selectFxRate2: ' + selectFxRate)
            const initialJPY = Number(form.fx) * Number(selectFxRate);
            setForm((prev) => ({
                ...prev,
                jpy: initialJPY.toFixed(0),
            }));
        }
    }, [form.fx, selectFxRate]);

    // onChangeでselectFxの値を変更,入力欄制御
    const handleFXChange = (event) => {
        const selected = event.target.value;
        const rate = event.target.selectedOptions[0].getAttribute('data-rate');
        console.log('coin:' + selected)
        console.log('rate:' + rate)
        setSelectFxRate(rate);
        setSelectFx(selected);
        setForm((prev) => ({
            ...prev,
            rate: rate,
            coin: selected
        }));
    };

    useEffect(() => {
        console.log('form.coinが更新されました:', form.coin);
    }, [form.coin]);

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
            coin: form.coin,
            rate: form.coin !== 'JPY' ? form.rate : '',
            jpy: form.jpy,
            fx: form.coin !== 'JPY' ? form.fx : '',
            memo: form.memo,
        };

        try {
            await updateDoc(doc(db, 'input_data', selectedInputData.id), updatedItem);
            console.log('更新成功:', updatedItem);
            navigate('/input');
        } catch (error) {
            console.error('更新失敗:', error);
        }
    };

    // DBから為替情報取得
    // useEffect(() => {
    //     if (!user) return;
    //     const q = query(
    //         collection(db, "select_fx"),
    //         where("selectedProjectId", "==", selectedProjectRecord.id),
    //         where("userId", "==", user.uid)
    //     );
    //     const unsubscribe = onSnapshot(q, (querySnapshot) => {
    //         const FxData = [];
    //         querySnapshot.forEach((doc) => {
    //             FxData.push({ ...doc.data(), id: doc.id }); // idデータを追加
    //         });
    //         setListFx(FxData);
    //     });
    //     return () => unsubscribe();
    // }, [user, selectedProjectRecord]);

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
                    <label className="form-label">通貨を選択</label>
                    <select
                        name="coin"
                        onChange={handleFXChange}
                        className="form-select"
                        value={form.coin}
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
                        // value={selectFx !== 'JPY' ? form.fx * selectFxRate : form.jpy}
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

                <div className="button-group">
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => navigate('/list')}
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