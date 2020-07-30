import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';

import Banner from '../Banner';
import GameSelector from '../GameSelector';
import CreateGamePage from '../CreateGame';
import {
  withAuthorization,
  withEmailVerification,
  AuthUserContext,
} from '../Session';

import * as ROUTES from '../../constants/routes';

import 'bootstrap/dist/css/bootstrap.css';
import './Dashboard.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      createGameModalShow: false,
    }
  }

  render() {
    return (
      <div className="banner-wrapper">
        <Banner />
        <div>
          <div className="greeting">
            <p>Hi, {this.props.authUser.username}! Here are your games:</p>
          </div>
          <div className="dashboard-buttons">
            <Button variant="secondary" onClick={() => this.setState({ createGameModalShow: true })}>host</Button>{' '}
            <Button variant="secondary" as={Link} to={ROUTES.JOIN_GAME}>join</Button>
          </div>
          <div>
            <CreateGamePage
              show={this.state.createGameModalShow}
              onHide={() => this.setState({ createGameModalShow: false })}
            />
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

const condition = authUser => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
)(Dashboard);
