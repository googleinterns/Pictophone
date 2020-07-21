import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';
import * as ROUTES from '../../constants/routes';

const JoinGamePage = () => (
  <div>
    <h1>Join Game</h1>
    <JoinGameForm />
    <button type="button"><Link to={ROUTES.DASHBOARD}>Back to dashboard</Link></button>
  </div>
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
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      gameId,
      error,
    } = this.state;

    const isInvalid = gameId === '';

    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="gameId"
          value={gameId}
          onChange={this.onChange}
          type="text"
          placeholder="Enter the ID of the game you want to join."
        />

        <button disabled={isInvalid} type="submit">Join Game!</button>

        {error && <p>{error.message}</p>}
      </form>
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
