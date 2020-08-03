import React, { Component } from 'react';
import { withFirebase } from '../Firebase';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import Banner from '../Banner';
import { compose } from 'recompose';
import Canvas from './Canvas';
import WaitingRoom from '../WaitingRoom';
import { FabricContextProvider } from './FabricContextProvider';
import * as ROUTES from '../../constants/routes';
import { withAuthorization, withEmailVerification, AuthUserContext } from '../Session';
import './Game.css';

class Game extends Component {

  constructor(props) {
    super(props);
    this.state = {};

    this.fetchGame = this.fetchGame.bind(this);
    this.updateGame = this.updateGame.bind(this);
    this.copyGameId = this.copyGameId.bind(this);
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    this.setState({ gameId: id });
    this.fetchGame(id);
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  fetchGame(gameId) {
    // Set up listener for game data change
    const game = this.props.firebase.game(gameId);

    game.get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          this.unsubscribe = game.onSnapshot(snapshot => {
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
    this.setState({
      inProgress: game.currentPlayerIndex < game.players.length,
      gameName: game.gameName,
      playerInGame: game.players.includes(this.props.authUser.uid),
      gameStarted: game.hasStarted
    });
  }

  pageReturned(inProgress, gameExists, gameStarted, playerInGame) {
    if (!gameExists) {
      return <p>This game does not exist! Check your URL again.</p>
    } else if(!gameStarted || !playerInGame) {
      return <AuthUserContext.Consumer>
        {authUser =>
          <WaitingRoom uid={authUser.uid} />
        }
      </AuthUserContext.Consumer>
    } else if (inProgress) {
      return <AuthUserContext.Consumer>
        {authUser =>
          <div className="in-game">
            <Canvas uid={authUser.uid} />
          </div>
        }
      </AuthUserContext.Consumer>
    } else {
      return <div className="end-game"><FabricContextProvider /></div>
    }
  }

  copyGameId() {
    navigator.clipboard.writeText(this.state.gameId);
    this.setState({
      copied: true
    });
    setTimeout(() => {this.setState({copied: false})}, 700);
  }

  render() {
    const { inProgress, gameExists, gameName, gameId,
      copied, gameStarted, playerInGame} = this.state;

    return (
      <div className="banner-wrapper">
        <Banner />
        <div className="heading">
          <Button variant="secondary" as={Link} to={ROUTES.DASHBOARD}>Back to dashboard</Button>
          <p className="title">{ gameName }</p>
          <p>Game ID: { gameId }</p>
          <Button variant="outline-secondary" onClick={this.copyGameId}>
            {copied ? 'Copied!' : 'Copy Game ID'}
          </Button>
        </div>
        <div className="content-wrapper">
          { // Render according to game existence and status.
            this.pageReturned(inProgress, gameExists, gameStarted, playerInGame)
          }
        </div>
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
