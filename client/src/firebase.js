import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/analytics';

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

export default firebase.firestore();
