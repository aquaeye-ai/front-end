import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { withOktaAuth } from '@okta/okta-react';
import { 
  faBrain,
  faTint,
  faVideo,
  faFish,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from './Header';
import Body from './Body';
import Footer from './Footer';
import './Landing.scss';

export default withOktaAuth(class Landing extends Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
  }

  async login() {
    this.props.history.push('/login');
  }

  render() {
    if (this.props.authState.isPending) return null;
  
    if (this.props.authState.isAuthenticated)
      return (
        <Redirect to='/home' />
      );

    const loginBtn = <button onClick={this.login} className="log-btn">Login</button>

    return (
      <div className="App">
        <Header />
        <Body>
          <div className="landing-page">
            <div className="icon-container">
              <FontAwesomeIcon icon={faBrain} size="9x" className="rand-rot-1"/>
              <FontAwesomeIcon icon={faPlus} size="4x" className="rand-rot-2"/>
              <FontAwesomeIcon icon={faTint} size="9x" className="rand-rot-3"/>
              <FontAwesomeIcon icon={faPlus} size="4x" className="rand-rot-4"/>
              <FontAwesomeIcon icon={faVideo} size="9x" className="rand-rot-5"/>
              <FontAwesomeIcon icon={faPlus} size="4x" className="rand-rot-6"/>
              <FontAwesomeIcon icon={faFish} size="9x" className="rand-rot-7"/>
            </div>
            <div className="buttons-links-container">
              {loginBtn}
            </div>
          </div>
        </Body>
        <Footer />
      </div>
    );
  }
});
