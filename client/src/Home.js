import React, { Component } from 'react';
import { Link } from "react-router-dom";

import './Home.css';

class Home extends Component {
  render() {
    return (
      <div className="wrapper">
        <div className="title">PICTOPHONE</div>
        <div className="login">
          <Link to="/dashboard"><button className="login-button">Login</button></Link>
        </div>
      </div>
    );
  }
}

export default Home;
