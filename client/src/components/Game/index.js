import React, { Component } from 'react';
import '../App/App.css';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import Banner from '../Banner';
import { withAuthorization, withEmailVerification } from '../Session';
import { withFirebase } from '../Firebase';
import { compose } from 'recompose';
import * as ROUTES from '../../constants/routes';
import Endgame from './Endgame';
import Canvas from './Canvas';

class Game extends Component {

  constructor(props) {
    super(props);

    this.fetchGame = this.fetchGame.bind(this);
    this.updateGame = this.updateGame.bind(this);
  }

  async componentDidMount() {
    // TODO: Add error handling for invalid game/nonexistent ID
    const { id } = this.props.match.params;
    // TODO fetch user from firebase auth
    this.setState({ gameId: id });
    this.fetchGame(id);
  }

  fetchGame(gameId) {
    // Set up listener for game data change
    const doc = this.props.firebase.db.collection('games').doc(gameId);
    doc.onSnapshot(docSnapshot => {
      this.updateGame(docSnapshot.data());
    }, err => {
      console.log(`Encountered error: ${err}`);
    });

  }

  updateGame(game) {
    this.setState({ inProgress: game.inProgress });
  }

  render() {
    const { gameId, inProgress } = this.state;

    return (
      <div className="Canvas">
        <Banner />
        <Link to={ROUTES.DASHBOARD}><button>Back to home</button></Link>
        <h3>GAME { gameId }</h3>
        {inProgress? <Endgame /> : <Canvas />}
      </div>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
  withRouter,
  withFirebase,
  withEmailVerification,
)(Game);
