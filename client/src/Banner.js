import React, { Component } from 'react';
import { Navbar } from 'react-bootstrap';

import SignOutButton from './SignOut';

import 'bootstrap/dist/css/bootstrap.css';
import './Banner.css';

class Banner extends Component {
  render() {
    return (
      <Navbar bg="light" variant="light" sticky="top">
        <Navbar.Brand bsPrefix="banner-title">PICTOPHONE</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text className="banner-log-out">
            <SignOutButton />
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Banner;
