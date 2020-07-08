import React, { Component } from 'react';
import '../App.css';
import { withRouter } from 'react-router';
import Player from './Player.js';
import { saveAs } from 'file-saver';
import './literallycanvas.css';
import { withAuthorization, withEmailVerification } from '../Session';
import { withFirebase } from '../Firebase';
import { compose } from 'recompose';
const LC = require('literallycanvas');

class Canvas extends Component {

  constructor(props) {
    super(props);
    this.state = { players: [] };

    this.send = this.send.bind(this);
    this.saveDrawing = this.saveDrawing.bind(this);
    this.setLC = this.setLC.bind(this);
    this.fetchGame = this.fetchGame.bind(this);
    this.updateGame = this.updateGame.bind(this);
  }

  async componentDidMount() {
    // TODO: Add error handling for invalid game/nonexistent ID
    const { id } = this.props.match.params;
    // TODO fetch user from firebase auth
    this.setState({ gameId: id, user: 'testuser3' });
    this.fetchGame(id);
  }

  fetchGame(gameId) {
    // Set up listener for game data change
    const doc = this.props.firebase.db.collection('games').doc(gameId);
    doc.onSnapshot(docSnapshot => {
      this.updateGame(docSnapshot.data());
    }, err => {
      console.log(`Encountered error: ${err}`);
    });

  }

  updateGame(game) {
    // Set state to new game object's state
    this.setState({ currentPlayerIndex: game.currentPlayerIndex,
      players: game.players, drawings: game.drawings,
      timeLimit: game.timeLimit });

    // Determine whether to display drawing
    var index = game.players.indexOf(this.state.user);
    if (game.currentPlayerIndex >= index) {
      this.setState({ display: true });
    }
    if (game.currentPlayerIndex > index) {
      this.setState({ sent: true });
    }
  }

  async send() {
    const { players, currentPlayerIndex, user, gameId} = this.state;
    // Don't want player to send drawing when it's not their turn
    if (players.indexOf(user) !== currentPlayerIndex) return;
    const data = await new Promise(resolve => this.state.lc.getImage().toBlob(resolve));;
    const url = 'https://storage.cloud.google.com/pictophone-drawings/';

    // Send image URL to backend to sign
    // TODO add error handling
    const imgUrl = await fetch('/api/signUrl', {
      method: 'POST',
      headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
      },
      body: gameId + user + '.png',
    }).then((response) => response.text());

    // PUT data in bucket. For some reason fetch doesn't work, but xhr does
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', imgUrl, true);
    xhr.onerror = () => {
      alert('There was an error uploading your image :(')
    };
    xhr.setRequestHeader('Content-Type', 'image/png');
    xhr.send(data);
    xhr.onreadystatechange = () => {
       if (xhr.readyState === 4 && xhr.status === 200){
          // Advance the game if the image was uploaded successfully
          const gameRef = this.props.firebase.db.collection('games').doc(gameId);
          gameRef.update({
            drawings: this.props.firebase.firestore.FieldValue.arrayUnion(url + gameId + user + '.png')
          })
          gameRef.set({
            currentPlayerIndex: currentPlayerIndex + 1,
            inProgress: (currentPlayerIndex + 1) === players.length
          }, { merge: true });
       }
    }
  }

  saveDrawing() {
    const { gameId, user } = this.state;
    var filename = gameId + user + '.png';
    this.state.lc.getImage().toBlob(function(blob) {
      saveAs(blob, filename);
    });
  }

  setLC(lc) {
    this.setState({lc: lc});
  }

  render() {
    const { players, drawings, user, gameId } = this.state;

    return (
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
            {/* TODO: add error checking for first player */}
            {this.state.display ? <img src={drawings[players.indexOf(user) - 1]} alt="previous drawing" />
            : <p>It is not your turn yet. Please sit tight to receive the image!</p> }
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

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
  withRouter,
  withFirebase,
  withEmailVerification,
)(Canvas);
