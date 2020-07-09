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

    this.unsubscribe = this.props.firebase
      .user(this.props.uid)
      .onSnapshot(snapshot => {
        let gamesList = snapshot.data().games;
        let games = [];

        gamesList.forEach(game =>
          this.props.firebase
            .game(game)
            .onSnapshot(snapshot => {
              games.push({ ...snapshot.data(), gameId: snapshot.id });
              this.setState({ games });
            })
        );

        this.setState({ loading: false, currentUser: snapshot.data().username });
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
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
          <Card.Header>started by <b>{props.game.players[0]}</b> on <b>{props.game.startDate.toDate().toDateString()}</b></Card.Header>
          <Card.Body>
            <Card.Title>{props.game.gameName.toUpperCase()}</Card.Title>
            <Card.Text>
              currently <b>{props.game.players[props.game.currentPlayerIndex]}'s</b> turn ({props.game.currentPlayerIndex + 1}/{props.game.players.length})
            </Card.Text>
          </Card.Body>
        </Link>
      </Card>
    )}
  </div>
)

export default withFirebase(GameSelector);
