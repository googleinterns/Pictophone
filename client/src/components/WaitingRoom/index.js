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
      started: false,
      joined: false
    };

    this.enterGame = this.enterGame.bind(this);
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    let gameInstance = this.props.firebase.game(id);

    // Listens for changes in the database for player list & status of whether the game has started


     gameInstance.get()
      .then(docSnapshot => {
        if(docSnapshot.exists) {
          this.unsubscribe = gameInstance.onSnapshot(async (snapshot) => {

            if(snapshot.data().players.includes(this.props.uid)) {
              this.setState({
                joined: true
              })
            }

            const users = snapshot.data().players.map((player) => {
              return getUsername(player)
            })
            const usernames = await Promise.all(users);
            this.setState({
              isHost: snapshot.data().players.indexOf(this.props.uid) === 0,
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
    if(this.state.started && !this.state.joined) {
      this.props.firebase
        .doAddUserToGame(gameId)
        .then(() => {
          this.props.history.push(`/game/${gameId}`);
        })
    } else if(!this.state.started && !this.state.joined) {
      this.props.firebase
        .doAddUserToGame(gameId)
      this.setState({
        joined: true
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
    const { gameId, players, timeLimit, started, isHost, joined} = this.state

    const isInvalid = (!isHost && started === false && joined === true);

    return (
      <div>
        {timeLimit && <h3>Time Limit Per Turn: {timeLimit} minutes</h3>}
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
          {
            (() => {
              if(started) {
                return (
                   'Join'
                )
              } else {
                return (
                  joined ? 'Start' : 'Join Lobby'
                )
              }
            })()
          }
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
