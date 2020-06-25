import React, { Component } from 'react';
import { Link } from "react-router-dom";

import Banner from './Banner';

class Home extends Component {
  render() {
    return (
      <div className="Home">
        <Banner />
        <hr/>
        Hello world! This is the home page.
        <Link to="/game"><button>Go to game</button></Link>
      </div>
    );
  }
}

export default Home;
