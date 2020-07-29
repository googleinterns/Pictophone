import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Container, Col, Form, Button } from 'react-bootstrap';

import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';
import * as ROUTES from '../../constants/routes';

import './JoinGame.css';

const JoinGamePage = () => (
  <Container className="join-game-wrapper">
    <h2 className="join-game-heading">Join a game</h2>
    <JoinGameForm />
    <Button type="button"><Link to={ROUTES.DASHBOARD}>Back to dashboard</Link></Button>
  </Container>
);

const INITIAL_STATE = {
  gameId: '',
  error: null,
}

class JoinGameFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { gameId } = this.state;

    this.props.firebase
      .doAddUserToGame(gameId)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(`/game/${gameId}`);
      })
      .catch(error => {
        this.setState({ error });
      });

      event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value.trim() });
  };

  render() {
    const {
      gameId,
      error,
    } = this.state;

    const isInvalid = gameId === '';

    return (
      <Form className="join-game-form" onSubmit={this.onSubmit}>
        <Col>
          <Form.Group>
            <Form.Label>Game ID</Form.Label>
            <Form.Control
              name="gameId"
              value={gameId}
              onChange={this.onChange}
              type="text"
              placeholder="Enter the ID of the game you want to join."
            />
          </Form.Group>
        </Col>

        <div className="join-game-button">
          <Button disabled={isInvalid} type="submit">Join Game!</Button>
        </div>

        {error && <p>{error.message}</p>}
      </Form>
    );
  }
}

const JoinGameForm = compose(
  withRouter,
  withRouter,
  withFirebase,
)(JoinGameFormBase);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(JoinGamePage);

export { JoinGameForm };
