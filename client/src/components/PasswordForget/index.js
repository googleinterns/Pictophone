import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container, Col, Form, Button } from 'react-bootstrap';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

import 'bootstrap/dist/css/bootstrap.css';
import './PasswordForget.css';

const PasswordForgetPage = () => (
  <Container className="pwforget-form-wrapper">
    <h1 className="pwforget-form-heading">Forgot your password?</h1>
    <PasswordForgetForm />
  </Container>
);

const INITIAL_STATE = {
  email: '',
  error: null,
};

class PasswordForgetFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { email } = this.state;

    this.props.firebase
      .doPasswordReset(email)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
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
    const { email, error } = this.state;

    const isInvalid = email === '';

    return (
      <Form className="pwforget-form" onSubmit={this.onSubmit}>
        <Col>
          <Form.Group>
            <Form.Label>Enter your email to reset your password</Form.Label>
            <Form.Control
              name="email"
              value={this.state.email}
              autoComplete="email"
              onChange={this.onChange}
              type="text"
              placeholder="Email Address"
            />
          </Form.Group>
        </Col>

        <div className="pwforget-button">
          <Button disabled={isInvalid} type="submit">
            Reset My Password
          </Button>
        </div>

        {error && <p>{error.message}</p>}
      </Form>
    );
  }
}

const PasswordForgetLink = () => (
  <p>
    <Link to={ROUTES.PASSWORD_FORGET}>Forgot Password?</Link>
  </p>
);

export default PasswordForgetPage;

const PasswordForgetForm = withFirebase(PasswordForgetFormBase);

export { PasswordForgetForm, PasswordForgetLink };
