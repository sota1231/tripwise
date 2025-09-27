import React from 'react';
import './Header.css';

const Header = ({ selectedProjectName }) => {

  console.log('header：' + selectedProjectName)
  
  return (
    <header className="header">
      <h1 className="header-title">
        {selectedProjectName || '旅の記録'}
      </h1>
    </header>
  );
};

export default Header;