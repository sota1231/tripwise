import React from 'react'
import './Header.css';
import { Link } from 'react-router-dom';

const Header = ( selectedProjectName ) => {

    console.log(selectedProjectName)
  return (
    <>
      <div className='header'>
        <div>{selectedProjectName.selectedProjectName}</div>
      </div>
    </>

  )
}

export default Header