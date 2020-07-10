import React, { Component } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';

import 'bootstrap/dist/css/bootstrap.css';
import './Banner.css';

class Banner extends Component {
  render() {
    return (
      <Navbar bg="light" variant="light" sticky="top">
        <Navbar.Brand bsPrefix="banner-title">PICTOPHONE</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav.Link as={Link} to={ROUTES.ACCOUNT}>
            Account
          </Nav.Link>
          <Navbar.Text className="banner-log-out">
            <SignOutButton />
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Banner;
