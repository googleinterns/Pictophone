import React, { Component } from 'react';
import '../App/App.css';
import { withRouter } from 'react-router';
import { saveAs } from 'file-saver';
import { withAuthorization, withEmailVerification } from '../Session';
import { withFirebase } from '../Firebase';
import { compose } from 'recompose';
import JSZip from "jszip";
import FabricCanvas from './FabricCanvas';
const zip = new JSZip();

class Endgame extends Component {

  constructor(props) {
    super(props);
    this.state = { drawings: [], players: [], usernames: [] };

    this.downloadAll = this.downloadAll.bind(this);
    this.fetchGame = this.fetchGame.bind(this);
    this.idToUsername = this.idToUsername.bind(this);
    this.getMIMEType = this.getMIMEType.bind(this);
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    this.setState({ gameId: id });
    this.fetchGame(id);
  }

  componentWillUnmount() {
    // Clear state updates upon unmounting
    this.setState = () => {
      return;
    }
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

  fetchGame(gameId) {
    // Get game result, no need for listener since game is over
    const game = this.props.firebase.game(gameId);
    game.get().then((snapshot) => {
      const data = snapshot.data();
      this.setState({
        drawings: data.drawings,
        players: data.players,
        gameName: data.gameName
      });
      this.idToUsername(data.players);
    });
  }

  // TODO export to utility file
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

        // Check file signature against accepted image types
        var type = "";
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

  downloadAll() {
    // Use JSZip to put all drawings into a zip file
    const { drawings, usernames } = this.state;
    const folder = zip.folder('drawings');

    // Every player in the game generates one image
    const blobs = drawings.map(function (url, i) {
      return fetch('/api/signDownload', {
        method: 'POST',
        body: drawings[i]
      }).then((response) => response.text())
      .then(signedUrl => fetch(signedUrl))
      .then(response => response.blob());
    });

    // Wait for blobs to finish fetching and add them to a zip folder
    Promise.all(blobs).then(blobs =>
      Promise.all(blobs.map((blob, i) => this.getMIMEType(blob)))
    ).then(types => {
      blobs.forEach((blob, i) => folder.file(`${i+1} - ${usernames[i]}.${types[i]}`, blob, { binary: true }));
      zip.generateAsync({type : "blob"}).then(content => saveAs(content, 'drawings.zip'));
    });
  }

  render() {
    const { drawings, usernames, gameName } = this.state;

    return (
      <div className="Endgame">
        <h4>The game is finished! Here are the drawings:</h4>
        <p>The artwork may be overlapped.
          Feel free to arrange the canvas however you like!</p>
        { usernames.length ?
          <FabricCanvas drawings={drawings} players={usernames} title={gameName} />
          : null
        }
        <button onClick={this.downloadAll}>download images in .zip</button>
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
)(Endgame);
