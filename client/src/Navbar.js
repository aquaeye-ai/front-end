import React from "react";
import { withOktaAuth } from '@okta/okta-react';
import { 
  faSearch, 
  faBars, 
  faVideo,
  faSignOutAlt 
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from 'react-router-dom';
import {
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  FormInput,
  Collapse
} from "shards-react";
import './Navbar.scss';

export default withOktaAuth(class AppNavbar extends React.Component {
  constructor(props) {
    super(props);

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.toggleNavbar = this.toggleNavbar.bind(this);

    this.state = {
      dropdownOpen: false,
      collapseOpen: false
    };

    this.logout = this.logout.bind(this);
  }

  async logout() {
    this.props.authService.logout('/')
  }

  toggleDropdown() {
    this.setState({
      ...this.state,
      ...{
        dropdownOpen: !this.state.dropdownOpen
      }
    });
  }

  toggleNavbar() {
    this.setState({
      ...this.state,
      ...{
        collapseOpen: !this.state.collapseOpen
      }
    });
  }

  render() {
    if (this.props.authState.isPending) return null;

    const logoutBtn = this.props.authState.isAuthenticated ?
      <DropdownItem onClick={this.logout} className="log-btn">
        Logout
        <FontAwesomeIcon icon={faSignOutAlt} className="spaced-icon" />
      </DropdownItem> : 
      null; 

    const collapseMenu = this.props.authState.isAuthenticated ?
      <Collapse open={this.state.collapseOpen} navbar>
        <Nav navbar>
          <Dropdown
            open={this.state.dropdownOpen}
            toggle={this.toggleDropdown}
          >
            <DropdownToggle nav caret>
              <FontAwesomeIcon icon={faBars} />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem>
                <Link to='/streams'>
                  Livestreams
                  <FontAwesomeIcon icon={faVideo} className="spaced-icon" />
                </Link>
              </DropdownItem>
              {logoutBtn}
            </DropdownMenu>
          </Dropdown>
        </Nav>
      </Collapse> :
      null;

    return (
      <Navbar type="dark" theme="primary" expand="md">
        <NavbarBrand href="/">Aquaeye AI</NavbarBrand>
        <NavbarToggler onClick={this.toggleNavbar} />
        {collapseMenu}
      </Navbar>
    );
  }
});
