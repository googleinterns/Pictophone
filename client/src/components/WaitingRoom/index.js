import React, { Component } from 'react';
import { withFirebase } from '../Firebase';
import { compose } from 'recompose';
import { withAuthorization } from '../Session';

class WaitingRoomBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      players: [],
      gameId: '',
      gameName: '',
      timeLimit: 10,
      started: false
    };
  }

  async componentDidMount() {
    //Grab gameId & timeLimit to set those as well as gameName
    const { id } = this.props.match.params;
    const gameInstance = await this.props.firebase.game(id).get();
    this.setState({
      gameId: id,
      gameName: gameInstance.data().gameName,
      timeLimit: gameInstance.data().timeLimit
    });
  }

  async onPlayerListUpdate(gameId) {
    const game = await this.props.firebase.game(gameId).get();
    //console.log(this.state.players)
    game.onSnapshot((snapshot) =>
    {
      this.setState({
        players: snapshot.data().players
      });
    })
  }

  onGameStart(gameId) {
    let game = this.props.firebase.game(gameId);
    console.log('started');
    game.onSnapshot((snapshot) => {
      this.setState({
        started: snapshot.data().hasStarted
      });
    })
  }

  startGame = async (gameId) => {
     await this.props.firebase
      .game(gameId).get().hasStarted.update({
        hasStarted: true
      });
    }

  render() {
    const { players, timeLimit, started, gameName } = this.state
    console.log(players)
    return(
      <div>
        <h1>{gameName}</h1>
        <h3>Time Limit Per Turn: {timeLimit}</h3>
        <nav>
          <header>Host: {players[0]}</header>
          <ul style={{'listStyle': 'none'}}>
            {
              players.slice(1,players.length)
                .map((player) => <li>{player}</li>)
            }
          </ul>
        </nav>
        <button type="button" onClick={this.startGame}>{started ? 'Join' : 'Start'}</button>
      </div>
    );
  }
}

const condition = authUser => !!authUser;

const WaitingRoom = compose(
  withFirebase,
  withAuthorization(condition),
)(WaitingRoomBase)

export { WaitingRoom };
