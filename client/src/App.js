import React, { Component } from 'react';
import './App.css';
import { Link } from "react-router-dom";
import Player from './Player.js';
const LC = require('literallycanvas');

class App extends Component {
  state = {
    isLoading: true,
    users: "Not this"
  };

  constructor(props) {
    super(props);
    this.state = { sent: false, players: [] };

    this.send = this.send.bind(this);
  }

  async componentDidMount() {
    this.setState({ players: ['marshal', 'ankha', 'sherb', 'audie', 'raymond',
      'bob', 'marina'], currentPlayerIndex: 2 });
  }

  send() {
    this.setState({ sent: true, currentPlayerIndex: this.state.currentPlayerIndex + 1});
  }

  render() {
    const { players } = this.state;
    console.log(players);

    return (
      <div className="App">
        <Link to="/"><button>Back to home</button></Link>
        <h3>GAME 00001</h3>

        <div className="player-list">
          {/*
            Dynamically render the player chain with a name list. The 'status'
            indicates whether they are done with their turn.
            Renders an arrow after the name, if they are not the final player.
          */}
          {players.map((name, index) => (<span className="player-list">
            <Player name={name} status={index - this.state.currentPlayerIndex} />
            {(index !== players.length - 1) ? <span>&rarr;</span> : null}</span>
          ))}
        </div>

        <h4>Draw something based on the left image!</h4>
        <div className="img-displays">
          <div classname="prev-img">
            <img src="kitty.png" alt="placeholder" />
          </div>
          <div className="lc-container">
            <LC.LiterallyCanvasReactComponent imageURLPrefix="lc-assets/img" />
            {!this.state.sent && <button className="send-drawing" onClick={this.send}>Send</button>}
            {this.state.sent && <p className="send-drawing">Drawing sent!</p>}
          </div>
        </div>

      </div>
    );
  }
}

export default App;
