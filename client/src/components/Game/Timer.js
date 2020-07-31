import React, { Component } from 'react';
import { withFirebase } from '../Firebase';
import { withRouter } from 'react-router';
import { compose } from 'recompose';

class Timer extends Component {

  constructor(props) {
    super(props);
    this.state = {
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
          if(snapshot.data().gameStartTime !== null && snapshot.data().currentPlayerIndex === 0) {
            this.setState({
              currentPlayerIndex: snapshot.data().currentPlayerIndex + 1,
              startTime: snapshot.data().gameStartTime.seconds,
              timePerTurnInSeconds: parseInt(snapshot.data().timeLimit, 10) * 60,
            })
            this.setState({
              timeTurnWillEnd: ((this.state.timePerTurnInSeconds * this.state.currentPlayerIndex) + this.state.startTime),
            })
            this.setState({
              days: Math.floor((((this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) / 60) / 60)/ 24),
              hours: Math.floor(((this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) / 60) / 60) % 24,
              minutes: Math.floor((this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) / 60) % 60,
              seconds: (this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) % 60
            })
          } else if(snapshot.data().gameStartTime !== null) {
            this.setState({
              currentPlayerIndex: snapshot.data().currentPlayerIndex + 1,
              startTime: Math.floor(new Date().getTime() / 1000),
              timePerTurnInSeconds: parseInt(snapshot.data().timeLimit, 10) * 60,
            })
            this.setState({
              timeTurnWillEnd: ((this.state.timePerTurnInSeconds * this.state.currentPlayerIndex) + this.state.startTime),
            })
            this.setState({
              days: Math.floor((((this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) / 60) / 60)/ 24),
              hours: Math.floor(((this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) / 60) / 60) % 24,
              minutes: Math.floor((this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) / 60) % 60,
              seconds: (this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) % 60
            })
          }
        })
      }
    })

    this.myInterval = setInterval(async () => {
      const { days, hours, minutes, seconds } = this.state
      const gameRef = await this.props.firebase.game(id).get();

      if (seconds > 0) {
        this.setState({
          seconds: (this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) % 60
        })
      }
      if (seconds === 0) {
        if (minutes === 0 && hours === 0 && days === 0) {
          game.set({
            currentPlayerIndex: gameRef.data().currentPlayerIndex + 1,
          }, { merge: true })
          clearInterval(this.myInterval)
        } else {
          this.setState({
            days: Math.floor((((this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) / 60) / 60)/ 24),
            hours: Math.floor(((this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) / 60) / 60) % 24,
            minutes: Math.floor((this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) / 60) % 60,
            seconds: (this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) % 60
          })
        }
      }
    }, 1000)
  }

  componentWillUnmount() {

  }

  render() {
    const { days, hours, minutes, seconds } = this.state;

    return(
      <div>
          {
            (() => {
              if(minutes || seconds) {
                return (
                   (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0)
                  ? <h3>Times up!</h3>
                  : <h3>Time Remaining: { days > 0 && `${ days }:`}
                  { hours > 0 && `${ hours }:`}
                  { minutes }:{ seconds < 10 ? `0${ seconds }` : seconds }</h3>
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
