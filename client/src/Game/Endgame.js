import React, { Component } from 'react';
import '../App.css';
import { withRouter } from 'react-router';
import { saveAs } from 'file-saver';
import { withAuthorization, withEmailVerification } from '../Session';
import { withFirebase } from '../Firebase';
import { compose } from 'recompose';
import JSZip from "jszip";
const zip = new JSZip();

class Endgame extends Component {

  constructor(props) {
    super(props);
    this.state = { drawings: [], players: [] };

    this.downloadAll = this.downloadAll.bind(this);
    this.fetchGame = this.fetchGame.bind(this);
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    this.setState({ gameId: id });
    this.fetchGame(id);
  }

  fetchGame(gameId) {
    // Get final game info
    const doc = this.props.firebase.db.collection('games').doc(gameId);
    doc.get().then((snapshot) => {
      this.setState({ drawings: snapshot.data().drawings,
        players: snapshot.data().players });
    })
  }

  async downloadAll() {
    // Use JSZip to put all drawings into a zip file
    const { gameId, players } = this.state;
    const folder = zip.folder('drawings');
    await Promise.all(players.map(async (url, i) => {
      const filename = gameId + players[i] + '.png';

      // Send URL to backend to sign
      // Using workaround because
      var imgUrl = await fetch('/api/signUpload', {
        method: 'POST',
        body: filename
      }).then((response) => response.text())
      //then(brokenUrl => brokenUrl.replace("googleapis", "cloud.google"));
      imgUrl = "\""+imgUrl+"\"";

      const imageBlob = await fetch(imgUrl).then(response => response.blob());
      folder.file(filename, imageBlob, { binary: true });
    }));
    zip.generateAsync({type : "blob"}).then(content => saveAs(content, 'drawings.zip'));
  }

  render() {
    const { drawings } = this.state;

    return (
      <div className="Endgame">
        <h4>The game is finished! Here are the drawings:</h4>
        <div className="drawing-list">
          {drawings.map((url) => <img class="thumb" src={url} alt="result" />)}
        </div>
        <button onClick={this.downloadAll}>download all</button>
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
