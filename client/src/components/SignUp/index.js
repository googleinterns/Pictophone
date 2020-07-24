import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Container, Col, Form, Button } from 'react-bootstrap';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

import 'bootstrap/dist/css/bootstrap.css';
import './SignUp.css'

const SignUpPage = () => (
  <Container className="signup-form-wrapper">
    <h2 class="signup-form-heading">Sign Up</h2>
    <SignUpForm />
  </Container>
);

const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  error: null,
};

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  isUsernameUnique = async username => {
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: username
    };

    const url = '/validateUsername';

    const response = await fetch(url, options)
    const isUnique = await response.json();

    this.setState({ isUnique: isUnique });
  }

  onSubmit = event => {
    const { username, email, passwordOne } = this.state;
    const games = [];

    this.isUsernameUnique(username)
      .then(() => {
        if (this.state.isUnique) {
          return this.props.firebase
            .doCreateUserWithEmailAndPassword(email, passwordOne);
        } else {
          throw new Error('username already taken');
        }
      })
      .then(authUser => {
        return this.props.firebase
          .user(authUser.user.uid)
          .set({
            username,
            email,
            games,
          },
          { merge: true },
          );
      })
      .then(() => {
        return this.props.firebase.doSendEmailVerification();
      })
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.LANDING);
      })
      .catch(error => {
        console.log(error);
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === '';

    return (
      <Form className="signup-form" onSubmit={this.onSubmit}>
        <Col>
        <Form.Group>
          <Form.Label>Username</Form.Label>
          <Form.Control
            name="username"
            value={username}
            onChange={this.onChange}
            type="text"
            placeholder="Enter username"
          />
        </Form.Group>
        </Col>

        <Col>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              value={email}
              onChange={this.onChange}
              type="email"
              placeholder="Enter email"
            />
          </Form.Group>
        </Col>

        <Col>
          <Form.Group>
            <Form.Label>Password</Form.Label>
            <Form.Control
              name="passwordOne"
              value={passwordOne}
              onChange={this.onChange}
              type="password"
              placeholder="Enter password"
            />
          </Form.Group>
        </Col>

        <Col>
          <Form.Group>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              name="passwordTwo"
              value={passwordTwo}
              onChange={this.onChange}
              type="password"
              placeholder="Confirm password"
            />
          </Form.Group>
        </Col>

        <div class="signup-button">
        <Button disabled={isInvalid} type="submit">Sign Up</Button>
        </div>

        {error && <p>{error.message}</p>}
      </Form>
    );
  }
}

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

const SignUpForm = compose(
  withRouter,
  withFirebase,
)(SignUpFormBase);

export default SignUpPage;

export { SignUpForm, SignUpLink };
