import React from 'react';
import Nav from './Nav';

class Header extends React.Component {
  render() {
    return (
        <div className="header">
          <Nav />
          <div className="navbar navbar-inverse navbar-embossed navbar-expand-lg">
            <a className="navbar-brand" href="/">Aquaeye AI</a>
          </div>
        </div>
    );
  }
}

export default Header;
