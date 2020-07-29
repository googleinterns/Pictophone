import React from 'react';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { Container, Button, Navbar } from 'react-bootstrap';

import PasswordChangeForm from '../PasswordChange';
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from '../Session';
import * as ROUTES from '../../constants/routes';

import './Account.css';

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <div>
        <AccountPageBanner username={authUser.username} />
        <Container className="pwchange-form-wrapper">
          <PasswordChangeForm />
        </Container>
      </div>
    )}
  </AuthUserContext.Consumer>
);

const AccountPageBanner = (props) => (
  <Navbar bg="light" variant="light" sticky="top">
    <Navbar.Brand>Welcome to your account, {props.username}</Navbar.Brand>
    <Navbar.Toggle />
    <Navbar.Collapse className="justify-content-end">
      <Navbar.Text>
        <Button variant="info" type="button" as={Link} to={ROUTES.DASHBOARD} style={{ color: "white" }}>Back to dashboard</Button>
      </Navbar.Text>
    </Navbar.Collapse>
  </Navbar>
);

const condition = authUser => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
)(AccountPage);
