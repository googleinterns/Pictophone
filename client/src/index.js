import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/analytics';
import {
  BrowserRouter as Router,
} from "react-router-dom";

var firebaseConfig = {
  apiKey: "AIzaSyABhi5kPuJNuIQ1EowYCxHtcU0P3RfImks",
  authDomain: "phoebeliang-step.firebaseapp.com",
  databaseURL: "https://phoebeliang-step.firebaseio.com",
  projectId: "phoebeliang-step",
  storageBucket: "phoebeliang-step.appspot.com",
  messagingSenderId: "148022077758",
  appId: "1:148022077758:web:7634da3c587d507783a46f",
  measurementId: "G-46TXPPSF3P"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
