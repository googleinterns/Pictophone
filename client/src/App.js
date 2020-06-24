import React, { Component } from 'react';
import './App.css';
import { Link } from "react-router-dom";
const LC = require('literallycanvas');

class App extends Component {
  state = {
    isLoading: true,
    users: "Not this"
  };

  constructor(props) {
    super(props);
    this.state = { sent: false };

    this.send = this.send.bind(this);
  }

  async componentDidMount() {
    const response = await fetch('api/users');
    const body = await response.text();
    this.setState({ users: body, isLoading: false });
  }

  send() {
    this.setState({ sent: true });
  }

  render() {
    const {users, isLoading} = this.state;

    if (isLoading) {
      return <p>Loading...</p>;
    }

    return (
      <div className="App">
        <Link to="/"><button>Back to home</button></Link>
        <h3>GAME 00001</h3>
        <p>
          Players: marshal &rarr; ankha &rarr; sherb &rarr; audie &rarr;
          raymond &rarr; bob &rarr; marina
        </p>
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
