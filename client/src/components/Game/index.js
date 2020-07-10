import React, { Component } from 'react';
import { withFirebase } from '../Firebase';
import '../App/App.css';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import Banner from '../Banner';
import { compose } from 'recompose';
import Canvas from './Canvas';
import Endgame from './Endgame';
import * as ROUTES from '../../constants/routes';
import { withAuthorization, withEmailVerification } from '../Session';;

class Game extends Component {

  constructor(props) {
    super(props);
    this.state = {};

    this.fetchGame = this.fetchGame.bind(this);
    this.updateGame = this.updateGame.bind(this);
  }

  async componentDidMount() {
    // TODO: Add error handling for invalid game/nonexistent ID
    const { id } = this.props.match.params;
    console.log(id);
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
      <div className="Game">
        <Banner />
        <Link to={ROUTES.DASHBOARD}><button>Back to home</button></Link>
        <h3>GAME { gameId }</h3>
        {inProgress ? <Canvas /> : <Endgame />}
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
