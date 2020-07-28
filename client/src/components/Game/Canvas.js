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
    this.state = { players: [], usernames: [], file: null };

    this.send = this.send.bind(this);
    this.saveDrawing = this.saveDrawing.bind(this);
    this.setLC = this.setLC.bind(this);
    this.fetchGame = this.fetchGame.bind(this);
    this.updateGame = this.updateGame.bind(this);
    this.idToUsername = this.idToUsername.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getMIMEType = this.getMIMEType.bind(this);
    this.getImage = this.getImage.bind(this);
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    this.setState({ gameId: id, userId: this.props.uid });
    this.fetchGame(id);
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
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
      this.props.firebase.user(id).get().then(snapshot =>
        snapshot.data().username)
    );
    const names = await Promise.all(usernames);
    this.setState({ usernames: names });
  }

  /*
   * Inspects file header for its true MIME type.
   * From https://stackoverflow.com/a/29672957
   *
   * @param blob file to be inspected
   * @return Promise to get file extension for image files, or unknown if other
   */
  getMIMEType(blob) {
    var fileReader = new FileReader();

    return new Promise((resolve, reject) => {

      fileReader.onerror = () => {
        fileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };

      fileReader.onloadend = function(e) {
        var arr = (new Uint8Array(e.target.result)).subarray(0, 4);
        var header = "";
        for(var i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        console.log(header);

        // Check file signature against accepted image types
        switch (header) {
          case "89504e47":
              type = "png";
              break;
          case "47494638":
              type = "gif";
              break;
          case "ffd8ffe0":
          case "ffd8ffe1":
          case "ffd8ffe2":
          case "ffd8ffe3":
          case "ffd8ffe8":
              type = "jpeg";
              break;
          default:
              type = "unknown";
              break;
          }

        resolve(type);
      };
      fileReader.readAsArrayBuffer(blob);
    });

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

    const MIMEType = this.getMIMEType(data);
    if (MIMEType === "unknown") {
      alert('This is not a jpeg, png, or gif!');
      return;
    }

    // Send image URL to backend to sign
    // TODO add error handling
    const imgUrl = await fetch('/api/signUpload', {
      method: 'POST',
      headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
      },
      body: `${gameId}${userId}.${MIMEType}`,
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
    xhr.setRequestHeader('Content-Type', `image/${MIMEType}`);
    xhr.send(data);
    xhr.onreadystatechange = () => {
       if (xhr.readyState === 4 && xhr.status === 200){
          // Advance the game if the image was uploaded successfully
          // TODO listen to main bucket?
          const gameRef = this.props.firebase.game(gameId);
          gameRef.update({
            drawings: this.props.firebase.firestore.FieldValue.arrayUnion(gameId + userId + `.${MIMETYPE}`)
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

  render() {
    const { prevImg, usernames,
      currentPlayerIndex, display, sent, file } = this.state;

    return (
      <div>
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
            <button onClick={this.saveDrawing}>Download canvas drawing</button>
            <p>
              To send your own image instead of the canvas, upload something below!
              Please choose a jpeg, png, or gif under 5MB.
            </p>
            {file && <img src={file} width="100" alt="upload preview" />}
            <form>
            <input type="file" accept="image/*" onChange={this.handleChange} />
            <input type="reset" value="Clear selection" onClick={() => this.setState({ file: null })} />
            </form>
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
