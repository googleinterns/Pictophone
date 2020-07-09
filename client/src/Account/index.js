import React from 'react';
import { compose } from 'recompose';

import PasswordChangeForm from '../PasswordChange';
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from '../Session';

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <div>
        <h1>Account: {authUser.email}</h1>
        <PasswordChangeForm />
      </div>
    )}
  </AuthUserContext.Consumer>
);

const condition = authUser => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
)(AccountPage);
