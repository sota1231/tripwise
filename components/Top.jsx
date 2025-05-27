import React from 'react'
import { Link } from 'react-router-dom'
import './Top.css';

const Top = ({ handleLogout, onAddProject, project, onDeleteProject,
    setSelectedProjectId,setSelectedProjectName
}) => {
    console.log(project)

    const handleSelect = (data) => {
        setSelectedProjectId(data.id);
        setSelectedProjectName(data.name);
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
                                <Link to="/sum" onClick={() => handleSelect(data)}>
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
                                <button 
                                    className="delete-button"
                                    onClick={() => onDeleteProject(data.id)}
                                >
                                    削除
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Top