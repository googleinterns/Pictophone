import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import './Home.css';

class Home extends Component {
  render() {
    // Hard coded for now, these games would be taken from the server
    const games = ['oo0j05CCUJNqQxSFSNEI'];

    return (
      <div className="home-wrapper">
        <div className="home-title">PICTOPHONE</div>
        <div className="login-button">
          <Link to="/dashboard"><Button variant="info" size="lg">Login</Button></Link>
        </div>
          <Link to={`/game/${games[0]}`}><button>Go to game</button></Link>
      </div>
    );
  }
}

export default Home;
