import React, { Component } from 'react';
import Banner from './Banner';
import GameSelector from './GameSelector';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import './Dashboard.css';

class HostButton extends Component {
  render() {
    return (
      <Button variant="secondary">host</Button>
    );
  }
}

class JoinButton extends Component {
  render() {
    return (
      <Button variant="secondary">join</Button>
    );
  }
}

class RandomButton extends Component {
  render() {
    return (
      <Button variant="secondary">random</Button>
    );
  }
}

class Dashboard extends Component {
  render() {
    // Hard coded for now, these games would be taken from the database
    const games = ['oo0j05CCUJNqQxSFSNEI'];

    return (
      <div className="banner-wrapper">
        <Banner />
        <div className="greeting">
          <p>Hi, Bob! Here are your games:</p>
        </div>
        <div className="dashboard-buttons">
          <HostButton />{' '}
          <JoinButton />{' '}
          <RandomButton />
        </div>
        <div className="games-list">
          <GameSelector id={games[0]}/>
        </div>
      </div>
    );
  }
}

export default Dashboard;

