import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
const LC = require('literallycanvas');

class App extends Component {
  state = {
    isLoading: true,
    users: "Not this"
  };

  async componentDidMount() {
    const response = await fetch('api/users');
    const body = await response.text();
    this.setState({ users: body, isLoading: false });
  }

  render() {
    const {users, isLoading} = this.state;

    if (isLoading) {
      return <p>Loading...</p>;
    }

    return (
      <div>
        <div>
      <LC.LiterallyCanvasReactComponent imageURLPrefix="lc-assets/img" />

      </div>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div className="App-intro">
            <p>{users}</p>
          </div>
        </header>
      </div>
      </div>
    );
  }
}

export default App;
