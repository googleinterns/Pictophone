import React, { Component } from 'react';
import { Link } from "react-router-dom";

import './Home.css';

class Home extends Component {
  render() {
    // Hard coded for now, these games would be taken from the server
    const games = ['oo0j05CCUJNqQxSFSNEI'];

    return (
      <div className="Home">
        Hello world! This is the home page.
        <Link to={`/game/${games[0]}`}><button>Go to game</button></Link>
      <div className="wrapper">
        <div className="title">PICTOPHONE</div>
        <div className="login">
          <Link to="/dashboard"><button className="login-button">Login</button></Link>
        </div>
      </div>
      </div>
    );
  }
}

export default Home;
