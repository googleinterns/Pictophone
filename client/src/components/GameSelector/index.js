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
      currentUser: '',
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    let user = this.props.firebase.user(this.props.uid);

    user.get().then(userDoc => {
      let gamesList = userDoc.data().games;
      let games = [];

      gamesList.forEach(game => {
        this.props.firebase.game(game).get().then(gameDoc => {
          let gameData = { ...gameDoc.data(), gameId: gameDoc.id };

          console.log(gameData.currentPlayerIndex);
          console.log(gameData.players);
          console.log(gameData.players[gameData.currentPlayerIndex]);

          this.props.firebase
            .user(gameData.players[gameData.currentPlayerIndex])
            .get().then(currentPlayerDoc => {
              gameData["currentPlayer"] = currentPlayerDoc.data().username;

              this.props.firebase
                .user(gameData.players[0]).get().then(startPlayerDoc => {
                  gameData["startPlayer"] = startPlayerDoc.data().username;

                  games.push(gameData);

                  this.setState({ games });
                });
            });
        });
      });

      this.setState({ loading: false, currentUser: userDoc.data().username });
    })
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

const Game = (props) => (
  <div className="game-card">
    {props.game && (
      <Card border="dark" style={{ width: '97.5%'}}>
        <Link to={`/game/${props.game.gameId}`}>
          <Card.Header>started by <b>{props.game.startPlayer}</b> on <b>{props.game.startDate.toDate().toDateString()}</b></Card.Header>
          <Card.Body>
            <Card.Title>{props.game.gameName.toUpperCase()}</Card.Title>
            <Card.Text>
              currently <b>{props.game.currentPlayer}'s</b> turn ({props.game.currentPlayerIndex + 1}/{props.game.players.length})
            </Card.Text>
          </Card.Body>
        </Link>
      </Card>
    )}
  </div>
)

export default withFirebase(GameSelector);
