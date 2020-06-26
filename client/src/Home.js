import React, { Component } from 'react';
import { Link } from "react-router-dom";

class Home extends Component {
  render() {
    // Hard coded for now, these games would be taken from the server
    const games = ['oo0j05CCUJNqQxSFSNEI'];

    return (
      <div className="Home">
        Hello world! This is the home page.
        <Link to={`/game/${games[0]}`}><button>Go to game</button></Link>
      </div>
    );
  }
}

export default Home;
