import { addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import './Input.css';


const Input = ({ user, selectedProjectId }) => {

    const navigate = useNavigate();
    const [selectFx, setSelectFx] = useState('JPY'); // 選択通貨を保持 入力欄制御
    const [selectFxRate, setSelectFxRate] = useState(null); // 選択通貨のレートを保持
    const [listFx, setListFx] = useState(null); // 為替情報取得・保存


    // プロジェクト未選択の場合TOPに遷移
    useEffect(() => {
        if (!selectedProjectId) {
            navigate("/");
        }

    }, [selectedProjectId, navigate])

    // formの準備
    const [form, setForm] = useState({
        modDate: '',
        kind: '',
        name: '',
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
            jpy: form.jpy,
            fx: form.fx,
            memo: form.memo,
            modDate: form.modDate,
            userId: user.uid,
            projectId: selectedProjectId,
        };

        try {
            await addDoc(collection(db, 'input_data'), newItem);
            console.log('登録成功:', newItem);
            setForm({
                modDate: '',
                kind: '',
                name: '',
                jpy: '',
                fx: '',
                memo: ''
            })
        } catch (error) {
            console.error('登録失敗:', error);
        }
    };

    // DBから為替情報取得
    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "select_fx"),
            where("selectedProjectId", "==", selectedProjectId),
            where("userId", "==", user.uid)
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const FxData = [];
            querySnapshot.forEach((doc) => {
                FxData.push({ ...doc.data(), id: doc.id }); // idデータを追加
            });
            setListFx(FxData);
        });
        return () => unsubscribe();
    }, [user, selectedProjectId]);


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
                        value={selectFx}
                    >
                        <option value="JPY">JPY</option>
                        {Array.isArray(listFx) && listFx.length > 0 ? (
                            listFx.map((data) => (
                                <option
                                    key={data.id}
                                    value={data.code}
                                    className="project-item"
                                    data-rate={data.rate}
                                >
                                    {data.code}
                                </option>
                            ))
                        ) : (
                            <option disabled>通貨データが読み込まれていません</option>
                        )}
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
                        value={selectFx !== 'JPY' ? form.fx * selectFxRate : form.jpy}
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