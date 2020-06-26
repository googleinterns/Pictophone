import React, { Component } from 'react';
import './App.css';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import Player from './Player.js';
import { saveAs } from 'file-saver';
import './literallycanvas.css';
import Banner from './Banner';
const LC = require('literallycanvas');

class Canvas extends Component {
  state = {
    isLoading: true,
  };

  constructor(props) {
    super(props);
    this.state = { sent: false, players: [] };

    this.send = this.send.bind(this);
    this.saveDrawing = this.saveDrawing.bind(this);
    this.setLC = this.setLC.bind(this);
  }

  async componentDidMount() {
    const { id } = this.props.match.params
    console.log(id);
    this.setState({ players: ['marshal', 'ankha', 'sherb', 'audie', 'raymond',
      'bob', 'marina'], currentPlayerIndex: 2 });
  }

  send() {
    this.setState({ sent: true, currentPlayerIndex: this.state.currentPlayerIndex + 1});
  }

  saveDrawing() {
    var filename = "drawing.png";
    this.state.lc.getImage().toBlob(function(blob) {
      saveAs(blob, filename);
    });
  }

  setLC(lc) {
    this.setState({lc: lc});
  }

  render() {
    const { players } = this.state;

    return (
      <div className="Canvas">
        <Banner />
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
          <div className="prev-img">
            <img src="kitty.png" alt="placeholder" />
          </div>
          <div className="lc-container">
            <LC.LiterallyCanvasReactComponent onInit={this.setLC} imageURLPrefix="lc-assets/img" />
            <button onClick={this.saveDrawing}>Download drawing</button>
            {!this.state.sent && <button className="send-drawing" onClick={this.send}>Send</button>}
            {this.state.sent && <p className="send-drawing">Drawing sent!</p>}
          </div>
        </div>

      </div>
    );
  }
}

export default withRouter(Canvas);
