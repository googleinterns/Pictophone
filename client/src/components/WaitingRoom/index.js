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
      timeLimit: 10,
      started: false
    };

    this.onPlayerListUpdate = this.onPlayerListUpdate.bind(this);
    this.onGameStart = this.onGameStart.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  async componentDidMount() {
    //Grab gameId & timeLimit to set those as well as gameName
    const { id } = this.props.match.params;
    const gameInstance = await this.props.firebase.game(id).get();
    this.setState({
      gameId: id,
      timeLimit: gameInstance.data().timeLimit,
      started: gameInstance.data().hasStarted,
      players: gameInstance.data().players
    });
  }



  //Listens for an update to players
  async onPlayerListUpdate(gameId) {
    const game = this.props.firebase.game(gameId).get();
    game.on('child_added', async function(snapshot)
    {
      this.setState({
        players: snapshot.data().players
      })
    });
  }

  async onGameStart(gameId) {
    const game = await this.props.firebase.game(gameId).get();

    console.log('started');
    game.on('value', (snapshot) => {
      this.setState({
        started: snapshot.data().hasStarted
      })
    })
  }

  async startGame(gameId){
    const game = this.props.firebase.db.doc(`games/${gameId}`);
    game.update({
      hasStarted: true
    });
  }



  render() {
    const { gameId, players, timeLimit, started } = this.state
    console.log(players)
    return(
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
        <button type="button" onClick={() =>
          this.startGame(gameId)}>
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

export { WaitingRoom };
