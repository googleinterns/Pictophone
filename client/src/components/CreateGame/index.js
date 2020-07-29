import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Container, Col, Form, Button } from 'react-bootstrap';

import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';
import * as ROUTES from '../../constants/routes';

import './CreateGame.css';

const CreateGamePage = () => (
  <Container className="create-game-wrapper">
    <h1 className="create-game-heading">Create Game</h1>
    <CreateGameForm />
    <Button type="button"><Link to={ROUTES.DASHBOARD}>Back to dashboard</Link></Button>
  </Container>
);

const INITIAL_STATE = {
  gameName: '',
  timeLimit: '',
  maxNumPlayers: '',
  createdGameId: '',
  error: null,
};

class CreateGameFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { gameName, timeLimit, maxNumPlayers } = this.state;

    this.props.firebase
      .doCreateGame(gameName, timeLimit, maxNumPlayers)
      .then(gameRef => {
        this.setState({ ...INITIAL_STATE });
        this.setState({ createdGameId: gameRef.id });
        this.props.history.push(`/game/${gameRef.id}`);
      })
      .catch(error => {
        this.setState({ error });
      });

      event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      gameName,
      timeLimit,
      maxNumPlayers,
      createdGameId,
      error,
    } = this.state;

    const isInvalid =
      gameName === '' ||
      maxNumPlayers === '';

    return (
      <Form className="create-game-form" onSubmit={this.onSubmit}>
        <Col>
          <Form.Group>
            <Form.Label>Game name</Form.Label>
            <Form.Control
              name="gameName"
              value={gameName}
              onChange={this.onChange}
              type="text"
              placeholder="Game Name"
            />
          </Form.Group>
        </Col>

        <Col>
          <Form.Group>
            <Form.Label>Time limit per turn (leave blank for untimed games)</Form.Label>
            <Form.Control
              name="timeLimit"
              value={timeLimit}
              onChange={this.onChange}
              type="number"
              placeholder="Time Limit Per Turn (minutes)"
            />
          </Form.Group>
        </Col>

        <Col>
          <Form.Group>
            <Form.Label>Maximum number of players</Form.Label>
            <Form.Control
              name="maxNumPlayers"
              value={maxNumPlayers}
              onChange={this.onChange}
              type="number"
              placeholder="Maximum Number of Players"
            />
          </Form.Group>
        </Col>

        <div className="create-game-button">
          <Button disabled={isInvalid} type="submit">Create Game</Button>
        </div>

        {createdGameId !== '' && (
          <p>Your game ID is {createdGameId}. Share this with your friends to add them to the game!</p>
        )}

        {error && <p>{error.message}</p>}
      </Form>
    );
  }
}

const CreateGameForm = compose(
  withRouter,
  withFirebase,
)(CreateGameFormBase);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(CreateGamePage);

export { CreateGameForm };
