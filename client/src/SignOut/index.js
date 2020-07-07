import React from 'react';
import { Button } from 'react-bootstrap';
import { withFirebase } from '../Firebase';

import 'bootstrap/dist/css/bootstrap.css';

const SignOutButton = ({ firebase }) => (
  <Button variant="info" size="sm" onClick={firebase.doSignOut}>
    Sign Out
  </Button>
);

export default withFirebase(SignOutButton);
