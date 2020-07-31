import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { compose } from 'recompose';

import Banner from '../Banner';
import GameSelector from '../GameSelector';
import CreateGamePage from '../CreateGame';
import JoinGamePage from '../JoinGame';
import {
  withAuthorization,
  withEmailVerification,
  AuthUserContext,
} from '../Session';

import 'bootstrap/dist/css/bootstrap.css';
import './Dashboard.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      createGameModalShow: false,
      joinGameModalShow: false,
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
            <Button variant="secondary" onClick={() => this.setState({ joinGameModalShow: true })}>join</Button>
          </div>
          <div>
            <CreateGamePage
              show={this.state.createGameModalShow}
              onHide={() => this.setState({ createGameModalShow: false })}
            />
            <JoinGamePage
              show={this.state.joinGameModalShow}
              onHide={() => this.setState({ joinGameModalShow: false })}
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
