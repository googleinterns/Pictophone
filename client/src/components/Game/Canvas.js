import React, { Component } from 'react';
import '../App/App.css';
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
    this.state = { players: [], usernames: [] };

    this.send = this.send.bind(this);
    this.saveDrawing = this.saveDrawing.bind(this);
    this.setLC = this.setLC.bind(this);
    this.fetchGame = this.fetchGame.bind(this);
    this.updateGame = this.updateGame.bind(this);
    this.idToUsername = this.idToUsername.bind(this);
    this.getImage = this.getImage.bind(this);
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    this.setState({ gameId: id, userId: this.props.uid });
    this.fetchGame(id);
  }

  fetchGame(gameId) {
    // Don't worry about private games for now
    // Set up listener for game data change
    const game = this.props.firebase.game(gameId);
    game.onSnapshot(docSnapshot => {
      this.updateGame(docSnapshot.data());
    }, err => {
      console.log(`Encountered error: ${err}`);
    });

    // Get previous user's image
    game.get().then(snapshot => {
      const data = snapshot.data();
      const userIndex = data.players.indexOf(this.props.uid);
      if (userIndex > 0) {
        this.getImage(data.drawings[userIndex - 1]);
      }
    });

  }

  async idToUsername(players) {
    // For the MVP, we won't listen for username changes
    // TODO add listener in Project Alpha
    const usernames = players.map(id =>
      this.props.firebase.user(id).get().then(snapshot =>
        snapshot.data().username)
    );
    const names = await Promise.all(usernames);
    this.setState({ usernames: names });
  }

  updateGame(game) {
    // Set state to new game object's state
    this.setState({ currentPlayerIndex: game.currentPlayerIndex,
      players: game.players, drawings: game.drawings,
      gameName: game.gameName,
      timeLimit: game.timeLimit });

    // Determine whether to display drawing
    var index = game.players.indexOf(this.state.userId);
    if (game.currentPlayerIndex >= index) {
      this.setState({ display: true });
    }
    if (game.currentPlayerIndex > index) {
      this.setState({ sent: true });
    }

    // Convert player IDs to their usernames
    this.idToUsername(game.players);
  }

  async send() {
    const { players, currentPlayerIndex, userId, gameId, lc} = this.state;
    // Don't want player to send drawing when it's not their turn
    if (players.indexOf(userId) !== currentPlayerIndex) return;

    // Make sure the canvas is not empty
    const image = lc.getImage();
    if (image === null) return;

    const data = await new Promise(resolve => image.toBlob(resolve));
    const url = gameId + userId + '.png';

    // Send image URL to backend to sign
    // TODO add error handling
    const imgUrl = await fetch('/api/signUpload', {
      method: 'POST',
      headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
      },
      body: url,
    }).then((response) => response.text());

    // Send information for email
    let emailType = 'turn';
    if(currentPlayerIndex+1 >= players.length) {
      emailType = 'end';
    }
    await fetch('/api/notify', {
      method: 'POST',
      headers: {
        'Accept': 'application/x-www-form-urlencoded, multipart/form-data, text/plain',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'gameID=' + gameId + '&emailType=' + emailType,
    }).then((response) => {
      console.log(response.text());
    });

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
          const gameRef = this.props.firebase.game(gameId);
          gameRef.update({
            drawings: this.props.firebase.firestore.FieldValue.arrayUnion(url)
          })
          gameRef.set({
            currentPlayerIndex: currentPlayerIndex + 1,
          }, { merge: true });
       }
    }
  }

  saveDrawing() {
    const { gameName } = this.state;
    var filename = gameName + '.png';
    this.state.lc.getImage().toBlob(function(blob) {
      saveAs(blob, filename);
    });
  }

  setLC(lc) {
    this.setState({lc: lc});
  }

  async getImage(filename) {
    const url = await fetch('/api/signDownload', {
      method: 'POST',
      body: filename
    }).then((response) => response.text());
    this.setState({ prevImg: url });
  }

  render() {
    const { players, prevImg, userId, usernames,
      currentPlayerIndex, display, sent } = this.state;
    const userIndex = players.indexOf(userId);

    return (
      <div>
        <div className="player-list">
          {/*
            Dynamically render the player chain with a name list. The 'status'
            indicates whether they are done with their turn.
            Renders an arrow after the name, if they are not the final player.
          */}
          {usernames.map((name, index) => (<span className="player-list">
            <Player name={name} status={index - currentPlayerIndex} />
            {(index !== usernames.length - 1) ? <span>&rarr;</span> : null}</span>
          ))}
        </div>

        <h4>Draw something based on the left image!</h4>
        <div className="img-displays">
          <div className="prev-img">
            { // Check whether or not to display the previous image.
              (() => {
                if (userIndex === 0) {
                 return <p>Draw an image to send to the next person!</p>
                } else if (display && prevImg) {
                  return <img src={prevImg} alt="previous drawing" />
                } else {
                  return <p>It is not your turn yet. Please sit tight to receive the image!</p>
              }})()
            }
          </div>
          <div className="lc-container">
            <LC.LiterallyCanvasReactComponent onInit={this.setLC} imageURLPrefix="lc-assets/img" />
            <button onClick={this.saveDrawing}>Download drawing</button>
            {sent ? <p className="send-drawing">Drawing sent!</p>
              : <button className="send-drawing" onClick={this.send}>Send</button>}
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
