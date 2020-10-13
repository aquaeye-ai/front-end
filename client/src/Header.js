import React from 'react';
import AppNavbar from './Navbar';
import './Header.scss';

class Header extends React.Component {
  render() {
    return (
      <div className="header">
        <AppNavbar />
      </div>
    );
  }
}

export default Header;
