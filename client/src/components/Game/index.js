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
import { withAuthorization, withEmailVerification, AuthUserContext } from '../Session';;

class Game extends Component {

  constructor(props) {
    super(props);
    this.state = {};

    this.fetchGame = this.fetchGame.bind(this);
    this.updateGame = this.updateGame.bind(this);
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    this.setState({ gameId: id });
    this.fetchGame(id);
  }

  fetchGame(gameId) {
    // Set up listener for game data change
    const game = this.props.firebase.game(gameId);

    game.get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          game.onSnapshot(snapshot => {
          this.updateGame(snapshot.data());
          }, err => {
            console.log(`Encountered error: ${err}`);
          });
          this.setState({ gameExists: true });
        } else {
          this.setState({ gameExists: false });
        }
    });



  }

  updateGame(game) {
    this.setState({ inProgress: game.currentPlayerIndex < game.players.length });
  }

  render() {
    const { gameId, inProgress, gameExists } = this.state;

    return (
      <div className="Game">
        <Banner />
        <Link to={ROUTES.DASHBOARD}><button>Back to home</button></Link>
        <h3>GAME { gameId }</h3>
        { // Render according to game existence and status.
          (() => {
            if (!gameExists) {
              return <p>This game does not exist! Check your URL again.</p>
            } else if (inProgress) {
              return <AuthUserContext.Consumer>
                {authUser =>
                  <Canvas uid={authUser.uid} />
                }
              </AuthUserContext.Consumer>
            } else {
              return <Endgame />
            }
          })()
        }
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
