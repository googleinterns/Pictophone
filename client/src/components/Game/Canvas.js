import React, { Component } from 'react';
import { withRouter } from 'react-router';
import Player from './Player.js';
import { saveAs } from 'file-saver';
import './literallycanvas.css';
import { withAuthorization, withEmailVerification } from '../Session';
import { withFirebase } from '../Firebase';
import { compose } from 'recompose';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { getUsername, getMIMEType } from '../Helpers';
const LC = require('literallycanvas');

class Canvas extends Component {

  constructor(props) {
    super(props);
    this.state = { players: [], usernames: [], file: null };

    this.send = this.send.bind(this);
    this.saveDrawing = this.saveDrawing.bind(this);
    this.setLC = this.setLC.bind(this);
    this.fetchGame = this.fetchGame.bind(this);
    this.updateGame = this.updateGame.bind(this);
    this.idToUsername = this.idToUsername.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getImage = this.getImage.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
    this.putImageInBucket = this.putImageInBucket.bind(this);
    this.setUpBucketListener = this.setUpBucketListener.bind(this);
    this.renderTooltip = this.renderTooltip.bind(this);
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    this.setState({ gameId: id, userId: this.props.uid });
    this.fetchGame(id);
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
    this.statusListener && this.statusListener();
  }

  fetchGame(gameId) {
    // Don't worry about private games for now
    // Set up listener for game data change
    const game = this.props.firebase.game(gameId);
    this.unsubscribe = game.onSnapshot(docSnapshot => {
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
      getUsername(id)
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
    if (game.currentPlayerIndex !== index) {
      this.setState({ sendable: false });
    } else {
      this.setState({ sendable: true });
    }
    if (game.currentPlayerIndex > index) {
      this.setState({sent: true});
    }

    // Convert player IDs to their usernames
    this.idToUsername(game.players);
  }

  async send() {
    const { players, currentPlayerIndex, userId, gameId, lc} = this.state;
    // Don't want player to send drawing when it's not their turn
    if (players.indexOf(userId) !== currentPlayerIndex) return;

    // Grab image from canvas or uploaded file
    let data = null;
    if (this.state.file != null) {
      // Prioritize using the atached file if it exists
      data = await fetch(this.state.file).then(r => r.blob());
    } else {
      const image = lc.getImage();
      if (image === null) return; // Make sure canvas isn't empty
      data = await new Promise(resolve => image.toBlob(resolve));
    }

    const MIMEType = await getMIMEType(data);
    if (MIMEType === "unknown") {
      alert('This is not a jpeg, png, or gif!');
      return;
    }
    const filename = `${gameId}${userId}.${MIMEType}`;
    this.setState({ sendable: false, sending: true });

    // Send image URL to backend to sign
    // TODO add error handling
    const imgUrl = await fetch('/api/signUpload', {
      method: 'POST',
      headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
      },
      body: filename,
    }).then((response) => response.text());

    this.setUpBucketListener(filename);
    this.putImageInBucket(imgUrl, data, MIMEType);

  }

  setUpBucketListener(filename) {
    const statusRef = this.props.firebase.db
      .collection("upload-progress").doc(filename);
    statusRef.set({
      status: "incomplete"
    })
    this.statusListener = statusRef.onSnapshot(doc => {
      const data = doc.data();
      // Ignore first occurence
      if (data.status === "incomplete") return;
      this.setState({ sendable: true, sending: false });
      if (data.ok) {
        this.sendEmail();
        // Advance the game if the image was uploaded successfully
        const gameRef = this.props.firebase.game(this.state.gameId);
        gameRef.update({
          drawings: this.props.firebase.firestore.FieldValue.arrayUnion(filename)
        })
        gameRef.set({
          currentPlayerIndex: this.state.currentPlayerIndex + 1,
        }, { merge: true });
      } else {
        alert(`Please try again. ${data.status}`);
      }
    });
  }

  putImageInBucket(imgUrl, data, MIMEType) {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', imgUrl, true);
    xhr.onerror = () => {
      alert('There was an error uploading your image :(')
    };
    xhr.setRequestHeader('Content-Type', `image/${MIMEType}`);
    xhr.send(data);
    xhr.onreadystatechange = () => {
       if (xhr.readyState === 4 && xhr.status === 200){
          console.log('Image successfully in uploaded. Now validating...');
       }
    }
  }

  sendEmail() {
    const { currentPlayerIndex, players, gameId } = this.state;
    const emailType = (currentPlayerIndex === players.length) ? 'end' : 'turn';
    fetch('/api/notify', {
      method: 'POST',
      headers: {
        'Accept': 'application/x-www-form-urlencoded, multipart/form-data, text/plain',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `gameID=${gameId}&emailType=${emailType}`,
    }).then((response) => {
      console.log(response.text());
    });
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

  handleChange(event) {
    var file = event.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert('Your file is too large. Please upload something under 5MB!');
    } else {
      if (this.state.file !== null) {
        URL.revokeObjectURL(this.state.file);
      }
      this.setState({
        file: URL.createObjectURL(file)
      });
    }
  }

  async getImage(filename) {
    const url = await fetch('/api/signDownload', {
      method: 'POST',
      body: filename
    }).then((response) => response.text());
    this.setState({ prevImg: url });
  }

  renderTooltip(props) {
    return (
      <Tooltip id="button-tooltip" {...props}>
        To send your own image instead of the canvas, upload something below! <br />
        Make sure to clear the selection if you change your mind and decide to use the built-in canvas. <br />
        Please choose a jpeg, png, or gif under 5MB.
      </Tooltip>
    );
  }

  render() {
    const { prevImg, usernames, players, sent, sending,
      currentPlayerIndex, display, sendable, file } = this.state;
    const userIndex = players.indexOf(this.props.uid);

    return (
      <div className="Canvas">
        <div className="player-list">
          {/*
            Dynamically render the player chain with a name list. The 'status'
            indicates whether they are done with their turn.
            Renders an arrow after the name, if they are not the final player.
          */}
          {usernames.map((name, index) => (<span key={name} className="player-list">
            <Player name={name} status={index - currentPlayerIndex} />
            {(index !== usernames.length - 1) ? <span>&rarr;</span> : null}</span>
          ))}
        </div>

        <p className="title">Draw something based on the left image!</p>
        <div className="img-displays">
          <div className="prev-img">
            { // Check whether or not to display the previous image.
              (() => {
                if (userIndex === 0) {
                 return <p>You are the first to draw. Create an image to send to the next person!</p>
                } else if (display && prevImg) {
                  return <img src={prevImg} style={{ maxWidth: 400 }} alt="previous drawing" />
                } else {
                  return <p>It is not your turn yet. Please sit tight to receive the image!</p>
              }})()
            }
          </div>
          <div className="lc-container">
            <div className="lc-component">
              <LC.LiterallyCanvasReactComponent
                onInit={this.setLC}
                imageURLPrefix={`${process.env.PUBLIC_URL}/lc-assets/img`}
              />
            </div>
            <Button variant="outline-secondary" onClick={this.saveDrawing} className="download-drawing">
              Download canvas drawing
            </Button>

            {file && <img src={file} width="100" alt="upload preview" />}
            <form>
              <input type="file" accept="image/*" onChange={this.handleChange} />
              <input type="reset" value="Clear selection" onClick={() => this.setState({file: null})} />
              <OverlayTrigger
                placement="bottom"
                delay={{ show: 100, hide: 400 }}
                overlay={this.renderTooltip}
              >
                <span><Button variant="link" disabled><u>?</u></Button></span>
              </OverlayTrigger>
            </form>

            <Button
              variant="outline-secondary"
              className="send-drawing"
              onClick={this.send}
              disabled={!sendable}>
                {
                  (() => {
                    if (sent) return (<span>Sent!</span>);
                    if (sending) return (<span>Sending...</span>);
                    return (<span>Send</span>);
                  })()
                }
             </Button>
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
