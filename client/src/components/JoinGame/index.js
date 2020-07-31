import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Col, Form, Button, Modal } from 'react-bootstrap';

import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';

import './JoinGame.css';

const JoinGamePage = (props) => (
  <Modal
    { ...props }
    size="lg"
    aria-labelledby="contained-modal-title-vcenter"
    centered
  >
    <Modal.Header closeButton>
      <Modal.Title id="contained-modal-title-vcenter">Join a game</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <JoinGameForm />
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={props.onHide}>Close</Button>
    </Modal.Footer>
  </Modal>
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
