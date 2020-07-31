import React, { Component } from 'react';
import { withFirebase } from '../Firebase';
import { withRouter } from 'react-router';
import { compose } from 'recompose';

class Timer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minutes: 99,
      seconds: 99,
      initialSet: false
    }
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    const game = this.props.firebase.game(id);

    game.get()
    .then(docSnapshot => {
      if(docSnapshot.exists) {
        game.onSnapshot((snapshot) => {
          if(snapshot.data().gameStartTime !== null) {
            this.setState({
              currentPlayerIndex: snapshot.data().players.length,
              startTime: snapshot.data().gameStartTime.seconds,
              timePerTurnInSeconds: parseInt(snapshot.data().timeLimit, 10) * 60,
            })
            this.setState({
              timeTurnWillEnd: ((this.state.timePerTurnInSeconds * this.state.currentPlayerIndex) + this.state.startTime),
              currentTime: Math.floor(new Date().getTime() / 1000),
            })
            this.setState({
              minutes: Math.floor((this.state.timeTurnWillEnd - this.state.currentTime) / 60),
              seconds: (this.state.timeTurnWillEnd - this.state.currentTime) % 60
            })
          }
        })
      }
    })

    this.myInterval = setInterval(async () => {
      const { seconds, minutes } = this.state
      const gameRef = await this.props.firebase.game(id).get();

      if (seconds > 0) {
        this.setState({
          seconds: seconds - 1
        })
      }
      if (seconds === 0) {
        if (minutes === 0) {
          game.set({
            currentPlayerIndex: gameRef.data().currentPlayerIndex + 1,
          }, { merge: true })
          clearInterval(this.myInterval)
        } else {
          this.setState({
            minutes: minutes - 1,
            seconds: 59
          })
        }
      }
    }, 1000)
  }

  render() {
    const { minutes, seconds } = this.state;

    return(
      <div>
          {
            (() => {
              if(minutes || seconds) {
                return (
                   (minutes <= 0 && seconds <= 0)
                  ? <h3>Times up!</h3>
                  : <h3>Time Remaining: { minutes }:{ seconds < 10 ? `0${ seconds }` : seconds }</h3>
                )
              }
            })()
          }
      </div>
    )
  }
}

export default compose(
  withFirebase,
  withRouter
)(Timer);
