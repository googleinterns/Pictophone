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
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    this.setState({ gameId: id });
    this.fetchGame(id);
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
    Promise.all(blobs);
    blobs.forEach((blob, i) => folder.file(i+1 + ' - ' + usernames[i] + '.png', blob, { binary: true }));
    zip.generateAsync({type : "blob"}).then(content => saveAs(content, 'drawings.zip'));
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
