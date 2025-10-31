import React from 'react';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapLocationDot } from '@fortawesome/free-solid-svg-icons';

const Header = ({ selectedProjectName }) => {

  console.log('header：' + selectedProjectName)

  return (
    <header className="header">
      <h1 className="header-title">
        <FontAwesomeIcon icon={faMapLocationDot} className="header-icon" />
        <span className="header-text">{selectedProjectName || '旅の記録'}</span>
      </h1>
    </header>
  );
};

export default Header;