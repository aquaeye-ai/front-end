import React from "react";
import { withOktaAuth } from '@okta/okta-react';
import { 
  Navbar,
  Nav,
  NavDropdown
} from 'react-bootstrap';
import { 
  faBars, 
  faVideo,
  faSignOutAlt 
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './Navbar.scss';

export default withOktaAuth(class AppNavbar extends React.Component {
  constructor(props) {
    super(props);

    this.logout = this.logout.bind(this);
  }

  async logout() {
    this.props.authService.logout('/')
  }

  render() {
    if (this.props.authState.isPending) return null;

    const logoutBtn = this.props.authState.isAuthenticated ?
			<NavDropdown.Item onClick={this.logout} className="log-btn">
				Logout
				<FontAwesomeIcon icon={faSignOutAlt} className="spaced-icon" />
      </NavDropdown.Item> : 
      null; 
    
    const collapseMenu = this.props.authState.isAuthenticated ?
      <Navbar.Collapse id="navbar-nav">
        <Nav className="mr-auto">
          <NavDropdown title={<FontAwesomeIcon icon={faBars} />} id="nav-dropdown">
            <NavDropdown.Item href='/streams'>
              Livestreams
              <FontAwesomeIcon icon={faVideo} className="spaced-icon" />
            </NavDropdown.Item>
						{logoutBtn}
          </NavDropdown>
        </Nav>
      </Navbar.Collapse> :
      null;

    return (
      <Navbar bg="dark" variant="dark" expand="md">
        <Navbar.Brand href="/">Aquaeye AI</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        {collapseMenu}
      </Navbar>
    );
  }
});
