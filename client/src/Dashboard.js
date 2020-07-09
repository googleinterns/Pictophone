import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { compose } from 'recompose';

import Banner from './Banner';
import GameSelector from './GameSelector';
import { withAuthorization, withEmailVerification } from './Session';

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
          <p>Hi, Sherb! Here are your games:</p>
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

const condition = authUser => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
)(Dashboard);
