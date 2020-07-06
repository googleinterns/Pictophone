import React, { Component } from 'react';
import { Link } from 'react-router-dom';
//import { Redirect } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { GoogleLogin } from 'react-google-login';
import 'bootstrap/dist/css/bootstrap.css';
import './Home.css';
// import gen from './signedUploadUrl';

const responseGoogle= (response) => {
  console.log(response);
}

class HomeButton extends Component {
  constructor(props) {
    super(props);
    this.changeLogInStatus = this.changeLogInStatus.bind(this);
  }

  changeLogInStatus() {
    this.props.onStatusChange();
  }

  render() {
    const isSignedIn = this.props.signinStatus;
    let button;

    if (isSignedIn) {
      button = <Link to="/dashboard"><Button variant="info" size="lg" id="loginButton">Enter</Button></Link>;
    }
    else {
      button =
        <GoogleLogin
          clientId="148022077758-4iklfh5g74id8aisgg8qqh8ckboa1qkc.apps.googleusercontent.com"
          render={renderProps => (
            <Button variant="info" size="lg" onClick={renderProps.onClick} disabled={renderProps.disabled}>Login</Button>
          )}
          buttonText="Login"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={'single_host_origin'}
        />
    }

    return (
      <div>
        {button}
      </div>
    );
  }
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.changeLogInStatus = this.changeLogInStatus.bind(this);
  }

  changeLogInStatus() {
    this.props.onLogIn(true);
  }

  render() {
    return (
      <div className="home-wrapper">
        <div className="home-title">PICTOPHONE</div>
        <div className="login-button">
          <HomeButton signinStatus={this.props.signinStatus} onStatusChange={this.changeLogInStatus} />
        </div>
      </div>
    );
  }
}

export default Home;
