import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withOktaAuth } from '@okta/okta-react';
import Header from './Header';
import Footer from './Footer';

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
      <button onClick={this.logout} class="log-btn">Logout</button> :
      <button onClick={this.login} class="log-btn">Login</button>;

    return (
      <div className="App home-page">
        <Header />
        <Link to='/' className="home-link">Home</Link><br/>
        <Link to='/streams' className="home-link">Streams</Link><br/>
        {button}
        <Footer />
      </div>
    );
  }
});
