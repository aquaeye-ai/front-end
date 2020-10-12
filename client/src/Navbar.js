import React from "react";
import { faSearch, faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

export default class AppNavbar extends React.Component {
  constructor(props) {
    super(props);

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.toggleNavbar = this.toggleNavbar.bind(this);

    this.state = {
      dropdownOpen: false,
      collapseOpen: false
    };
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
    return (
      <Navbar type="dark" theme="primary" expand="md">
        <NavbarBrand href="/">Aquaeye AI</NavbarBrand>
        <NavbarToggler onClick={this.toggleNavbar} />

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
                <DropdownItem>Action</DropdownItem>
                <DropdownItem>Another action</DropdownItem>
                <DropdownItem>Something else here</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}
