import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Container, Col, Form, Button } from 'react-bootstrap';

import { SignUpLink } from '../SignUp';
import { PasswordForgetLink } from '../PasswordForget';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

import 'bootstrap/dist/css/bootstrap.css';
import './SignIn.css';

const SignInPage = () => (
  <Container className="signin-form-wrapper">
    <h1 className="signin-form-heading">Sign In</h1>
    <SignInForm />
    <PasswordForgetLink />
    <SignUpLink />
  </Container>
);

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};

class SignInFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { email, password } = this.state;

    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(authUser => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.DASHBOARD);
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, password, error } = this.state;

    const isInvalid = password === '' || email === '';

    return (
      <Form className="signin-form" onSubmit={this.onSubmit}>
        <Col>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              value={email}
              autoComplete="username"
              onChange={this.onChange}
              type="text"
              placeholder="Email Address"
            />
          </Form.Group>
        </Col>

        <Col>
          <Form.Group>
            <Form.Label>Password</Form.Label>
            <Form.Control
              name="password"
              value={password}
              autoComplete="current-password"
              onChange={this.onChange}
              type="password"
              placeholder="Password"
            />
          </Form.Group>
        </Col>

        <div className="signin-button">
          <Button disabled={isInvalid} type="submit">Sign In</Button>
        </div>

        {error && <p>{error.message}</p>}
      </Form>
    );
  }
}

const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);

export default SignInPage;

export { SignInForm };
