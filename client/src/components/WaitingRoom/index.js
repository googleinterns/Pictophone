import React, { Component } from 'react';
import { withFirebase } from '../Firebase'
import { compose } from 'recompose';
import { withAuthorization } from '../Session';
import { getUsername } from '../Helpers';

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
    let gameInstance = this.props.firebase.game(id);

    // Listens for changes in the database for player list & status of whether the game has started



    this.unsubscribe = gameInstance.get()
      .then(docSnapshot => {
        if(docSnapshot.exists) {
          gameInstance.onSnapshot(async (snapshot) => {
            const users = snapshot.data().players.map((player) => {
              return getUsername(player)
            })
            const usernames = await Promise.all(users);
            this.setState({
              isHost: snapshot.data().players.indexOf(this.props.uid),
              players: usernames,
              started: snapshot.data().hasStarted,
              gameId: id,
              timeLimit: snapshot.data().timeLimit,
            })
          });
        }
      });
  }

  componentWillUnmount() {
    this.unsubcribe && this.unsubscribe();
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
      game.set({
        gameStartTime: this.props.firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      game.update({
        hasStarted: true
      });
    }
  }

  render() {
    const { gameId, players, timeLimit, started, isHost} = this.state

    const isInvalid = (isHost && started === false);

    return (
      <div>
        {timeLimit && <h3>Time Limit Per Turn: {timeLimit}</h3>}
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
