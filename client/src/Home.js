import React, { Component } from 'react';
import { Link } from "react-router-dom";

class Home extends Component {
  render() {
    return (
      <div className="Home">
        Hello world! This is the home page.
        <Link to="/game"><button>Go to game</button></Link>
      </div>
    );
  }
}

export default Home;
