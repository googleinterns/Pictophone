import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

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
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div className="App-intro">
            <p>{users}</p>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
