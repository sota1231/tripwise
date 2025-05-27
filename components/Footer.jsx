import React from 'react'
import './Footer.css';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className='footer'>
      <Link to="/" className={isActive('/') ? 'active' : ''}>
        選択画面
      </Link>
      <Link to="/input" className={isActive('/input') ? 'active' : ''}>
        入力
      </Link>
      <Link to="/List" className={isActive('/List') ? 'active' : ''}>
        一覧
      </Link>
      <Link to="/sum" className={isActive('/sum') ? 'active' : ''}>
        集計
      </Link>
      
    </div>
  )
}

export default Footer