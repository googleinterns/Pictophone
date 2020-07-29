import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Col, Form, Button } from 'react-bootstrap';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

import './PasswordChange.css';

const INITIAL_STATE = {
  passwordOne: '',
  passwordTwo: '',
  error: null,
};

class PasswordChangeFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { passwordOne } = this.state;

    this.props.firebase
      .doPasswordUpdate(passwordOne)
      .then(() => {
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
    const { passwordOne, passwordTwo, error } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo || passwordOne === '';

    return (
      <Form className="pwchange-form" onSubmit={this.onSubmit}>
        <Col>
          <Form.Group>
            <Form.Label>Enter new password</Form.Label>
            <Form.Control
              name="passwordOne"
              value={passwordOne}
              autoComplete="passwordOne"
              onChange={this.onChange}
              type="password"
              placeholder="New Password"
            />
          </Form.Group>
        </Col>

        <Col>
          <Form.Group>
            <Form.Label>Confirm your new password</Form.Label>
            <Form.Control
              name="passwordTwo"
              value={passwordTwo}
              onChange={this.onChange}
              type="password"
              placeholder="Confirm New Password"
            />
          </Form.Group>
        </Col>

        <div className="pwchange-button">
          <Button disabled={isInvalid} type="submit">
            Change My Password
          </Button>
        </div>

        {error && <p>{error.message}</p>}
      </Form>
    );
  }
}

const PasswordChangeForm = compose(
  withRouter,
  withFirebase,
)(PasswordChangeFormBase);

export default PasswordChangeForm;
