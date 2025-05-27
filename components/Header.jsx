import React from 'react';
import './Header.css';

const Header = ({ selectedProjectName }) => {
  return (
    <header className="header">
      <h1 className="header-title">
        {selectedProjectName.selectedProjectName || '旅の記録'}
      </h1>
    </header>
  );
};

export default Header;