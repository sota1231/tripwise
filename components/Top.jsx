import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import './Top.css';
import { saveSelectedProject } from './LocalStorageProject';
import { saveProjectRecord, getPaymentComplete } from './LocalInputData';

const Top = ({ onLogout, onAddProject, project, onDeleteProject,
    setSelectedProjectRecord, fetchData, formatted, setChange, currentUser
}) => {
    const [selectedItem, setSelectedItem] = useState(null); // 「…」を押下した時にセット
    const [isEditing, setIsEditing] = useState(false); // 「名前を変更する」を押下した時にセット
    const [newName, setNewName] = useState(''); // onChageで入力中にセットされる
    const [projectPayments, setProjectPayments] = useState({}); // プロジェクトごとの支払い完了情報

    // 全プロジェクトの支払い完了情報を読み込む
    useEffect(() => {
        const loadAllPayments = async () => {
            const payments = {};
            for (const proj of project) {
                const payment = await getPaymentComplete(proj.id);
                if (payment && payment.payments && payment.payments.length > 0) {
                    // 支払い完了したユーザー名の配列を作成
                    payments[proj.id] = payment.payments.map(p => p.completedBy);
                }
            }
            setProjectPayments(payments);
        };
        loadAllPayments();
    }, [project]);

    // プロジェクト押下で中に入る前にデータをセット
    const handleSelect = async(data) => {
        // ローカルストレージに保存
        saveSelectedProject(data, data.name);

        // useEffect用　これがないとuseEffectが動かず初期値が入らずでエラー
        setChange(data.id)
    };

    // 「…」を押下で発火
    const handleItemClick = (data, e) => {
        e.preventDefault();
        setSelectedItem(data); // selectedItemに選択したデータが格納
    };

    // 名前を変更して保存ボタン押下で発火
    const handleNameChange = async () => {
        if (!newName.trim()) return; // スペースを取り除いて結果が残らなければ処理を中止

        try {
            // Firestoreを更新
            const docRef = doc(db, "project_data", selectedItem.id);
            await updateDoc(docRef, {
                name: newName
            });

            // IndexedDBも更新
            const updatedProject = { ...selectedItem, name: newName };
            await saveProjectRecord(updatedProject);

            // 名前の変更処理が終わったらモーダルのための情報を全て初期化
            handleCloseMenu();
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    // モーダルを閉じる
    const handleCloseMenu = () => {
        setSelectedItem(null);
        setIsEditing(false);
        setNewName('');
    };

    return (
        <div className="top-container">
            <div>
                <div className="top-header">
                    <h1 className="top-title">旅行を選択</h1>
                    <div className="user-section">
                        {currentUser && (
                            <div className="current-user-info">
                                <div className="user-avatar-mini">
                                    {currentUser.displayName.charAt(0)}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{currentUser.displayName}</span>
                                    <span className={`user-status ${currentUser.isVerified ? 'verified' : 'unverified'}`}>
                                        {currentUser.isVerified ? '✓ 認証済み' : '未認証'}
                                    </span>
                                </div>
                            </div>
                        )}
                        <button className="logout-button" onClick={onLogout}>
                            ログアウト
                        </button>
                    </div>
                </div>
                <div className="header-buttons">
                    <button className="header-button" onClick={onAddProject}>
                        新規追加
                    </button>

                    <button className="header-button green" onClick={fetchData}>
                        DBから更新
                    </button>
                </div>
            </div>

            <div className="project-list">
                {project.map((data) => (
                    <div key={data.id} className="project-item">
                        <div className="title_deleteButton">
                            <div className="wordlist-note-title">
                                <Link to={data.fxRates ? "/input" : "/fx"} onClick={(e) => handleSelect(data, e)}>
                                    <span className="project-name">
                                        {data.name ? data.name : '名前入力なし'}
                                    </span>
                                    {projectPayments[data.id] && projectPayments[data.id].length > 0 && (
                                        <span className="verified-users">
                                            {projectPayments[data.id].join('・')}
                                        </span>
                                    )}
                                </Link>
                                <span>
                                    {data.modDate
                                        ? new Date(data.modDate).toLocaleDateString('ja-JP', {
                                            year: 'numeric',
                                            month: '2-digit'
                                        })
                                        : '--.--'
                                    }
                                </span>

                                <div className="menu-button" onClick={(e) => handleItemClick(data, e)}>
                                    <FontAwesomeIcon icon={faEllipsisVertical} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 「…」を押下でselectedItemがセットされることで表示される */}
            {selectedItem && !isEditing && (
                <div className="popup-menu">
                    <div className="popup-content">
                        <button onClick={() => setIsEditing(true)}>名前を変更する</button>
                        <button onClick={() => {
                            onDeleteProject(selectedItem.id);
                            handleCloseMenu();
                        }}>削除</button>
                        <button onClick={handleCloseMenu}>キャンセル</button>
                    </div>
                </div>
            )}

            {/* 「名前を変更する」押下でisEdingにセットされることで表示される */}
            {isEditing && (
                <div className="edit-popup">
                    <div className="edit-content">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="新しい名前を入力"
                        />
                        <div className="edit-buttons">
                            <button onClick={handleNameChange}>保存</button>
                            <button onClick={handleCloseMenu}>キャンセル</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Top