import React from 'react'
import { Link } from 'react-router-dom'

const Top = ({ handleLogout, onAddProject, project, onDeleteProject,
    setSelectedProjectId
}) => {
    console.log(project)

    const handleSelect = (id) => {
        setSelectedProjectId(id);
    };

    return (
        <>
            <div>旅の選択</div>
            <button onClick={onAddProject}>新規追加</button>
            <button onClick={handleLogout}>ログアウト</button>
            {project.map((data) => (
                <div
                    key={data.id}
                >
                    <div className='title_deleteButton'>
                        <div className='wordlist-note-title'>
                            <Link to="/sum" onClick={() => handleSelect(data.id)}>{data.name ? data.name : '名前入力なし'}</Link>
                            <button onClick={() => onDeleteProject(data.id)}>削除</button>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

export default Top