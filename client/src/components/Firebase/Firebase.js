import app from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_apiKey,
  authDomain: process.env.REACT_APP_authDomain,
  databaseURL: process.env.REACT_APP_databaseURL,
  projectId: process.env.REACT_APP_projectId,
  storageBucket: process.env.REACT_APP_storageBucket,
  messagingSenderId: process.env.REACT_APP_messagingSenderId,
  appId: process.env.REACT_APP_appId,
  measurementId: process.env.REACT_APP_measurementId,
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
      url: `https://${process.env.REACT_APP_projectId}.appspot.com`,
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

  // *** Game API ***

  game = gameId => this.db.doc(`games/${gameId}`);

  games = () => this.db.collection('games');

  doCreateGame = (gameName, timeLimit, maxNumPlayers) =>
    this.games().add({
      gameName: gameName,
      players: [],
      creationDate: this.fieldValue.serverTimestamp(),
      drawings: [],
      currentPlayerIndex: 0,
      hasStarted: false,
      timeLimit: timeLimit,
      maxNumPlayers: maxNumPlayers,
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
    const game = gameDoc.data();

    if (!gameDoc.exists) {
      throw new Error('Invalid game ID');
    }

    if (game.players.includes(this.auth.currentUser.uid)) {
      throw new Error('You\'re already in this game!');
    }

    if (game.currentPlayerIndex >= game.players.length) {
      throw new Error('This game has already ended!');
    }

    await this.game(gameId).update({
      players: this.fieldValue.arrayUnion(this.auth.currentUser.uid)
    });

    await this.user(this.auth.currentUser.uid).update({
      games: this.fieldValue.arrayUnion(gameId)
    });
  }

  doRemoveUserFromGame = async (gameId) => {
    const gameDoc = await this.game(gameId).get();
    const game = gameDoc.data();

    if (!gameDoc.exists) {
      throw new Error('Invalid game ID');
    }

    if (game.currentPlayerIndex >= game.players.length) {
      throw new Error('This game has already ended!');
    }

    await this.game(gameId).update({
      players: this.fieldValue.arrayRemove(this.auth.currentUser.uid)
    });

    await this.user(this.auth.currentUser.uid).update({
      games: this.fieldValue.arrayRemove(gameId)
    });
  }
}

export default Firebase;
