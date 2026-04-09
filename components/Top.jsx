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
    const [selectedItem, setSelectedItem] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [projectPayments, setProjectPayments] = useState({});

    useEffect(() => {
        const loadAllPayments = async () => {
            const payments = {};
            for (const proj of project) {
                const payment = await getPaymentComplete(proj.id);
                if (payment && payment.payments && payment.payments.length > 0) {
                    payments[proj.id] = payment.payments.map(p => p.completedBy);
                }
            }
            setProjectPayments(payments);
        };
        loadAllPayments();
    }, [project]);

    const handleSelect = async (data) => {
        saveSelectedProject(data, data.name);
        setChange(data.id);
    };

    const handleItemClick = (data, e) => {
        e.preventDefault();
        setSelectedItem(data);
    };

    const handleNameChange = async () => {
        if (!newName.trim()) return;
        try {
            const docRef = doc(db, "project_data", selectedItem.id);
            await updateDoc(docRef, { name: newName });
            const updatedProject = { ...selectedItem, name: newName };
            await saveProjectRecord(updatedProject);
            handleCloseMenu();
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

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
                    <button className="header-button" onClick={onAddProject}>新規追加</button>
                    <button className="header-button green" onClick={fetchData}>DBから更新</button>
                </div>
            </div>

            <div className="project-list">
                {project.map((data) => {
                    const fxKeys = data.fxRates && typeof data.fxRates === 'object'
                        ? Object.keys(data.fxRates)
                        : [];
                    const year = data.modDate ? data.modDate.slice(0, 4) : '--';
                    const month = data.modDate ? data.modDate.slice(5, 7) : '--';

                    return (
                        <div key={data.id} className="ticket-card">
                            <div className="ticket-top-bar" />
                            <div className="ticket-body">
                                <Link
                                    to={data.fxRates ? "/input" : "/fx"}
                                    onClick={() => handleSelect(data)}
                                    className="ticket-left"
                                >
                                    <div className="ticket-label">TRIP</div>
                                    <div className="ticket-name">
                                        {data.name || '名前入力なし'}
                                    </div>
                                    <div className="ticket-currencies">
                                        {fxKeys.length > 0
                                            ? fxKeys.map(code => (
                                                <span key={code} className="currency-stamp">{code}</span>
                                            ))
                                            : <span className="ticket-no-fx">通貨を設定 →</span>
                                        }
                                    </div>
                                    {projectPayments[data.id]?.length > 0 && (
                                        <div className="ticket-paid-badge">
                                            ✓ {projectPayments[data.id].join('・')} 精算済
                                        </div>
                                    )}
                                </Link>
                                <div className="ticket-right">
                                    <div className="ticket-date-label">DATE</div>
                                    <div className="ticket-date">
                                        <div>{year}</div>
                                        <div>{month}月</div>
                                    </div>
                                    <div className="menu-button" onClick={(e) => handleItemClick(data, e)}>
                                        <FontAwesomeIcon icon={faEllipsisVertical} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

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
    );
};

export default Top;
