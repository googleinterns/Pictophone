import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { compose } from 'recompose';

import Banner from '../Banner';
import GameSelector from '../GameSelector';
import { withAuthorization, withEmailVerification, AuthUserContext } from '../Session';

import 'bootstrap/dist/css/bootstrap.css';
import './Dashboard.css';

class Dashboard extends Component {
  render() {
    return (
      <div className="banner-wrapper">
        <Banner />
        <div>
          <div className="greeting">
            <p>Hi, {this.props.authUser.username}! Here are your games:</p>
          </div>
          <div className="dashboard-buttons">
            <HostButton />{' '}
            <JoinButton />{' '}
            <RandomButton />
          </div>
          <div className="games-list">
            <AuthUserContext.Consumer>
              {authUser =>
                <GameSelector uid={authUser.uid} />
              }
            </AuthUserContext.Consumer>
          </div>
        </div>
      </div>
    );
  }
}

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

const condition = authUser => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
)(Dashboard);
