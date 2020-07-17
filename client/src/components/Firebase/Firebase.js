import app from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyABhi5kPuJNuIQ1EowYCxHtcU0P3RfImks",
  authDomain: "phoebeliang-step.firebaseapp.com",
  databaseURL: "https://phoebeliang-step.firebaseio.com",
  projectId: "phoebeliang-step",
  storageBucket: "phoebeliang-step.appspot.com",
  messagingSenderId: "148022077758",
  appId: "1:148022077758:web:7634da3c587d507783a46f",
  measurementId: "G-46TXPPSF3P"
};

class Firebase {
  constructor() {
    app.initializeApp(firebaseConfig);
    app.analytics();

    this.auth = app.auth();
    // Access the database
    this.db = app.firestore();
    // For static firebase-admin utility methods
    this.firestore = app.firestore;
    this.fieldValue = app.firestore.FieldValue;
  }

  // *** Auth API ***
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () =>
    this.auth.signOut();

  doPasswordReset = email =>
    this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);

  doSendEmailVerification = () =>
    this.auth.currentUser.sendEmailVerification({
      url: 'http://localhost:3000',
    });

  // *** Merge Auth and DB User API *** //
  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid)
          .get()
          .then(snapshot => {
            const dbUser = snapshot.data();

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              ...dbUser,
            };

            next(authUser);
          });
      } else {
        fallback();
      }
    });

  // *** User API ***

  user = uid => this.db.doc(`users/${uid}`);

  users = () => this.db.collection('users');

  usernames = () => this.db.collection('usernames');

  // *** Game API ***

  game = gameId => this.db.doc(`games/${gameId}`);

  games = () => this.db.collection('games');

  doCreateGame = (gameName) =>
    this.games().add({
      gameName: gameName,
      players: [],
      startDate: this.fieldValue.serverTimestamp(),
      currentPlayerIndex: 0,
      hasStarted: false,
    })
    .then(gameRef => {
      gameRef.update({
        players: this.fieldValue.arrayUnion(this.auth.currentUser.uid)
      })
      .then(() => {
        this.user(this.auth.currentUser.uid).update({
          games: this.fieldValue.arrayUnion(gameRef.id)
        });
      });
      return gameRef;
    });

  doAddUserToGame = async (gameId) => {
    const gameDoc = await this.game(gameId).get();

    if (gameDoc.data().players.includes(this.auth.currentUser.uid)) {
      throw new Error('You\'re already in this game!');
    }

    await this.game(gameId).update({
      players: this.fieldValue.arrayUnion(this.auth.currentUser.uid)
    });

    await this.user(this.auth.currentUser.uid).update({
      games: this.fieldValue.arrayUnion(gameId)
    });
  }
}

export default Firebase;
