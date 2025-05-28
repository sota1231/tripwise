import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import './Top.css';

const Top = ({ handleLogout, onAddProject, project, onDeleteProject,
    setSelectedProjectId, setSelectedProjectName
}) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');

    const handleSelect = (data) => {
        setSelectedProjectId(data.id);
        setSelectedProjectName(data.name);
    };

    const handleItemClick = (data, e) => {
        e.preventDefault();
        setSelectedItem(data);
    };

    const handleNameChange = async () => {
        if (!newName.trim()) return;
        
        try {
            const docRef = doc(db, "projects", selectedItem.id);
            await updateDoc(docRef, {
                name: newName
            });
            setIsEditing(false);
            setNewName('');
            setSelectedItem(null);
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
            <div className="top-header">
                <h1 className="top-title">旅の選択</h1>
                <div className="header-buttons">
                    <button className="header-button" onClick={onAddProject}>
                        新規追加
                    </button>
                    <button className="header-button" onClick={handleLogout}>
                        ログアウト
                    </button>
                </div>
            </div>
            
            <div className="project-list">
                {project.map((data) => (
                    <div key={data.id} className="project-item">
                        <div className="title_deleteButton">
                            <div className="wordlist-note-title">
                                <Link to="/sum" onClick={(e) => handleSelect(data, e)}>
                                    {data.name ? data.name : '名前入力なし'}
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
    )
}

export default Top