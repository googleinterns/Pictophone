import React, { Component } from 'react';
import { withFirebase } from '../Firebase'
import { compose } from 'recompose';
import { withAuthorization } from '../Session';

class WaitingRoomBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      players: [],
      gameId: '',
      started: false
    };

    this.enterGame = this.enterGame.bind(this);
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    const gameInstance = this.props.firebase.game(id);

    // Listens for changes in the database for player list & status of whether the game has started

    gameInstance.get()
    .then(docSnapshot => {
      if(docSnapshot.exists) {
        gameInstance.onSnapshot((snapshot) => {
          this.setState({
            players: snapshot.data().players,
            started: snapshot.data().hasStarted,
            gameId: id,
            timeLimit: snapshot.data().timeLimit,
          })
        })
      }
    });
  }

  async enterGame(gameId){
    const game = this.props.firebase.db.doc(`games/${gameId}`);
    if(this.state.started) {
      this.props.firebase
        .doAddUserToGame(gameId)
        .then(() => {
          this.props.history.push(`/game/${gameId}`);
        })
    } else {
      game.update({
        hasStarted: true
      });
    }
  }

  render() {
    const { gameId, players, timeLimit, started } = this.state

    const isInvalid = (players.indexOf(this.props.uid) === 0 && started === false);

    return (
      <div>
        <h3>Time Limit Per Turn: {timeLimit}</h3>
        <nav>
          <header>Host: {players[0]}</header>
          <header>Players:</header>
          <ul style={{'listStyle': 'none'}}>
            {
              players.slice(1,players.length)
                .map((player) => <li>{player}</li>)
            }
          </ul>
        </nav>
        <button disabled= {isInvalid} type="button" onClick={() =>
          this.enterGame(gameId)}>
          {started ? 'Join' : 'Start'}
        </button>
      </div>
    );
  }
}

const condition = authUser => !!authUser;

const WaitingRoom = compose(
  withFirebase,
  withAuthorization(condition),
)(WaitingRoomBase)

export default WaitingRoom;
