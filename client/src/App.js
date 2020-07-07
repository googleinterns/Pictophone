import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from "react-router-dom";

import LandingPage from './Home';
import Dashboard from './Dashboard';
import Canvas from './Canvas';
import SignUpPage from './SignUp';
import SignInPage from './SignIn';
// phoebe will implement these later. remove for now
// import PasswordForgetPage from './PasswordForget';
// import AccountPage from './Account';
import { withAuthentication } from './Session';

import * as ROUTES from './constants/routes';

import './App.css';

const App = () => (
  <div className="App">
    <Router>
      <Switch>
        <Route exact path={ROUTES.LANDING}>
          <LandingPage />
        </Route>
        <Route path={ROUTES.SIGN_UP}>
          <SignUpPage />
        </Route>
        <Route exact path={ROUTES.DASHBOARD}>
          <Dashboard />
        </Route>
        <Route path={ROUTES.SIGN_IN}>
          <SignInPage />
        </Route>
        <Route path='/game/:id'>
          <Canvas />
        </Route>
      </Switch>
    </Router>
  </div>
);

export default withAuthentication(App);
