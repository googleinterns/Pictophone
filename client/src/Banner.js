import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from 'react-bootstrap';
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
            <b>sherb</b> <Link to="/">(log out)</Link>
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Banner;
