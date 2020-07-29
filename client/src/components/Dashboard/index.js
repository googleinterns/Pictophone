import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';

import Banner from '../Banner';
import GameSelector from '../GameSelector';
import {
  withAuthorization,
  withEmailVerification,
  AuthUserContext,
} from '../Session';

import * as ROUTES from '../../constants/routes';

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
      <Button variant="secondary" as={Link} to={ROUTES.CREATE_GAME}>host</Button>
    );
  }
}

class JoinButton extends Component {
  render() {
    return (
      <Button variant="secondary" as={Link} to={ROUTES.JOIN_GAME}>join</Button>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
)(Dashboard);
