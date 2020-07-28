import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from "react-router-dom";

import { withFirebase } from '../Firebase';

import 'bootstrap/dist/css/bootstrap.css';
import './GameSelector.css';

class GameSelector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      games: [],
    };
  }

  async componentDidMount() {
    this.setState({ loading: true });

    const userDoc = await this.props.firebase.user(this.props.uid).get();

    const gamesList = userDoc.data().games;
    let games = [];

    gamesList.forEach(async game => {
      const gameDoc = await this.props.firebase.game(game).get();
      let gameData = { ...gameDoc.data(), gameId: gameDoc.id, hasEnded: true };

      // get username of first player
      const startPlayerDoc = await this.props.firebase.user(gameData.players[0]).get();
      gameData["startPlayer"] = startPlayerDoc.data().username;

      // check if current player is the host
      gameData["isHost"] = gameData.startPlayer === userDoc.data().username;

      // calculate position of current user
      const userIndex = gameData.players.indexOf(this.props.uid);
      gameData["hasPlayed"] = true;

      if (userIndex >= gameData.currentPlayerIndex) {
        gameData["hasPlayed"] = false;
        gameData["turnsToWait"] = userIndex - gameData.currentPlayerIndex;
      }

      // Determine whether game is over
      if (gameData.currentPlayerIndex < gameData.players.length) {
        gameData["hasEnded"] = false;

        // get username of current player if game is not over
        const currentPlayerDoc = await this.props.firebase
          .user(gameData.players[gameData.currentPlayerIndex])
          .get();
        gameData["currentPlayer"] = currentPlayerDoc.data().username;
      }

      games.push(gameData);
      this.setState({ games });
    })

    this.setState({ loading: false });
  }

  render() {
    const { games, loading } = this.state;

    return (
      <div>
        {loading && <div>Loading...</div>}
        {games.map(game => (
          <Game key={game.gameId} game={game} />
        ))}
      </div>
    );
  }
}

class Game extends Component {
  render() {
    const hasPlayed = this.props.game.hasPlayed;
    const hasEnded = this.props.game.hasEnded;
    const hasStarted = this.props.game.hasStarted;

    let turnIndicator;

    if (hasEnded) {
      turnIndicator = <GameEnded />;
    }
    else if (!hasStarted) {
      turnIndicator = <GameStart game={this.props.game} />;
    }
    else {
      if (hasPlayed) {
        turnIndicator = <PlayedTurn game={this.props.game} />;
      } else {
        turnIndicator = <ToPlayTurn game={this.props.game} />;
      }
    }

    return (
      <div className="game-card">
        {this.props.game && (
          <Card border="dark" style={{ width: '97.5%'}}>
            <Link to={`/game/${this.props.game.gameId}`}>
              <Card.Header>started by <b>{this.props.game.startPlayer}</b> on <b>{this.props.game.startDate.toDate().toDateString()}</b></Card.Header>
              <Card.Body>
                <Card.Title>{this.props.game.gameName.toUpperCase()}</Card.Title>
                {turnIndicator}
              </Card.Body>
            </Link>
          </Card>
        )}
      </div>
    );
  }
}


const GameEnded = () => (
  <Card.Text>
    Game has ended! Click to see everyone's drawings!
  </Card.Text>
)

const PlayedTurn = (props) => (
  <div>
    <Card.Text>
      currently <b>{props.game.currentPlayer}'s</b> turn ({props.game.currentPlayerIndex + 1}/{props.game.players.length})
    </Card.Text>
    <Card.Text>
      You've already played! Please wait for the game to end.
    </Card.Text>
  </div>
)

const ToPlayTurn = (props) => (
  <div>
    <Card.Text>
      currently <b>{props.game.currentPlayer}'s</b> turn ({props.game.currentPlayerIndex + 1}/{props.game.players.length})
    </Card.Text>
    <Card.Text>
      {props.game.turnsToWait} player(s) to go before your turn!
    </Card.Text>
  </div>
)

const GameStart = (props) => (
  <div>
    <Card.Text>
      {props.game.isHost ? "Please navigate to the game page to start the game!" : "Please wait for the host to start the game."}
    </Card.Text>
  </div>
)

export default withFirebase(GameSelector);
