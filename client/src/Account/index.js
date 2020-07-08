import React from 'react';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';

import PasswordChangeForm from '../PasswordChange';
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from '../Session';
import * as ROUTES from '../constants/routes';

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <div>
        <h1>Account: {authUser.email}</h1>
        <PasswordChangeForm />
        <button type="button"><Link to={ROUTES.DASHBOARD}>Back to dashboard</Link></button>
      </div>
    )}
  </AuthUserContext.Consumer>
);

const condition = authUser => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
)(AccountPage);
