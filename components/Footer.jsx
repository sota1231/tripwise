import React from 'react'
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
      <div className='footer'>
        <Link to="/">TOP</Link>
        <Link to="/input">入力</Link>
        <Link to="/sum">集計</Link>
        <Link to="/home">ホーム</Link>
      </div>
    </>

  )
}

export default Footer