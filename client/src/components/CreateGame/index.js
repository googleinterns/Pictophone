import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';
import * as ROUTES from '../../constants/routes';
import Dashboard from '../Dashboard';

const CreateGamePage = () => (
  <div>
    <h1>Create Game</h1>
    <CreateGameForm />
    <button type="button"><Link to={ROUTES.DASHBOARD}>Back to dashboard</Link></button>
  </div>
);

const INITIAL_STATE = {
  gameName: '',
  createdGameId: '',
  error: null,
};

class CreateGameFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { gameName } = this.state;

    this.props.firebase
      .doCreateGame(gameName)
      .then(gameRef => {
        this.setState({ ...INITIAL_STATE });
        this.setState({ createdGameId: gameRef.id });
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
      createdGameId,
      error,
    } = this.state;

    const isInvalid = gameName === '';

    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="gameName"
          value={gameName}
          onChange={this.onChange}
          type="text"
          placeholder="Game Name"
        />

        <button disabled={isInvalid} type="submit">Create Game</button>

        {createdGameId !== '' && (
          <p>Your game ID is {createdGameId}. Share this with your friends to add them to the game!</p>
        )}

        {error && <p>{error.message}</p>}
      </form>
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
