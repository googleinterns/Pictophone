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
              this.setState({games});
            })
        );

          this.setState({
            loading: false,
          });

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
        {games && (
          <Game game={games} />
        )}
      </div>
    );
  }
}

const Game = (props) => (
  <Card border="dark" style={{ width: '97.5'}}>
    <Link to={`/game/`}>
      <Card.Header>started by <b>{props.game[0] && props.game[0].players[0]}</b> on <b>06 June 2020</b></Card.Header>
    </Link>
  </Card>
)

export default withFirebase(GameSelector);
