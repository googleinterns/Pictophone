import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from "react-router-dom";

import LandingPage from '../Home';
import Dashboard from '../Dashboard';
import Game from '../Game';
import SignUpPage from '../SignUp';
import SignInPage from '../SignIn';
import PasswordForgetPage from '../PasswordForget';
import AccountPage from '../Account';
import CreateGamePage from '../CreateGame';
import { withAuthentication, AuthUserContext } from '../Session';

import * as ROUTES from '../../constants/routes';

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
          <AuthUserContext.Consumer>
            {authUser =>
              <Dashboard authUser={authUser} />
            }
          </AuthUserContext.Consumer>
        </Route>
        <Route path={ROUTES.SIGN_IN}>
          <SignInPage />
        </Route>
        <Route path={ROUTES.ACCOUNT}>
          <AccountPage />
        </Route>
        <Route path={ROUTES.PASSWORD_FORGET}>
          <PasswordForgetPage />
        </Route>
        <Route path='/game/:id'>
          <Game />
        </Route>
        <Route path={ROUTES.CREATE_GAME}>
          <AuthUserContext.Consumer>
            {authUser =>
              <CreateGamePage authUser={authUser} />
            }
          </AuthUserContext.Consumer>
        </Route>
      </Switch>
    </Router>
  </div>
);

export default withAuthentication(App);
