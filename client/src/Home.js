import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withOktaAuth } from '@okta/okta-react';
import Header from './Header';
import Body from './Body';
import Footer from './Footer';
import './Home.scss';

export default withOktaAuth(class Home extends Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  async login() {
    this.props.authService.login('/');
  }

  async logout() {
    this.props.authService.logout('/');
  }

  render() {
    if (this.props.authState.isPending) return null;

    const button = this.props.authState.isAuthenticated ?
      <button onClick={this.logout} className="log-btn">Logout</button> :
      <button onClick={this.login} className="log-btn">Login</button>;

    return (
      <div className="App">
        <Header />
        <Body>
          <div className="home-page">
            <div className="buttons-links-container">
              <Link to='/' className="home-link">Home</Link><br/>
              <Link to='/streams' className="home-link">Streams</Link><br/>
              {button}
            </div>
          </div>
        </Body>
        <Footer />
      </div>
    );
  }
});
