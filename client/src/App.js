import React, { Component } from 'react';
import './App.css';
import { Switch, Route } from 'react-router-dom';
import Home from './Home';
import Dashboard from './Dashboard';
import Canvas from './Canvas';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSignedIn: false
    };
    this.changeLogInStatus = this.changeLogInStatus.bind(this);
  }

  changeLogInStatus(status) {
    this.setState({
      isSignedIn: status
    });
  }

  render() {
    return (
      <div className="App">
        <Switch>
          <Route exact path='/'>
            <Home
              signinStatus={this.state.isSignedIn}
              onLogIn={this.changeLogInStatus}
            />
          </Route>
          <Route exact path='/dashboard'>
            <Dashboard
              signinStatus={this.state.isSignedIn}
              onLogOut={this.changeLogInStatus}
            />
          </Route>
          <Route path='/game/:id'> <Canvas /> </Route>
        </Switch>
      </div>
    );
  }
}

export default App;
