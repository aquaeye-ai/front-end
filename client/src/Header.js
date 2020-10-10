import React from 'react';
import AppNavbar from './Navbar';

class Header extends React.Component {
  render() {
    return (
        <div className="header">
          {/*<Nav />*/}
          <AppNavbar />
					{/*<div className="company-name">Aquaeye.ai</div>*/}
        </div>
    );
  }
}

export default Header;
