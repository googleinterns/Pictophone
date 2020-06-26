import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import './Home.css';

class Home extends Component {
  render() {
    return (
      <div className="home-wrapper">
        <div className="home-title">PICTOPHONE</div>
        <div className="login-button">
          <Link to="/dashboard"><Button variant="info" size="lg">Login</Button></Link>
        </div>
      </div>
    );
  }
}

export default Home;
