import React, { Component } from 'react';
import { withFirebase } from '../Firebase';
import { withRouter } from 'react-router';
import { compose } from 'recompose';

class Timer extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    const game = this.props.firebase.game(id);

    game.get()
    .then(docSnapshot => {
      if(docSnapshot.exists) {
        this.unsubscribe = game.onSnapshot((snapshot) => {
          if(snapshot.data().gameStartTime !== null && snapshot.data().currentPlayerIndex === 0) {
            this.setState({
              currentPlayerIndex: snapshot.data().currentPlayerIndex + 1,
              startTime: snapshot.data().gameStartTime.seconds,
              timePerTurnInSeconds: parseInt(snapshot.data().timeLimit, 10) * 60,
            })
            this.setState({
              timeTurnWillEnd: (this.state.timePerTurnInSeconds + this.state.startTime),
            })
            this.setState({
              days: this.calculateTime('days'),
              hours: this.calculateTime('hours'),
              minutes: this.calculateTime('minutes'),
              seconds: this.calculateTime('seconds')
            })
          } else if(snapshot.data().gameStartTime !== null) {
            this.setState({
              startTime: Math.floor(new Date().getTime() / 1000),
              timePerTurnInSeconds: parseInt(snapshot.data().timeLimit, 10) * 60,
            })
            this.setState({
              timeTurnWillEnd: (this.state.timePerTurnInSeconds + this.state.startTime),
            })
            this.setState({
              days: this.calculateTime('days'),
              hours: this.calculateTime('hours'),
              minutes: this.calculateTime('minutes'),
              seconds: this.calculateTime('seconds')
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
          seconds: this.calculateTime('seconds')
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
            days: this.calculateTime('days'),
            hours: this.calculateTime('hours'),
            minutes: this.calculateTime('minutes'),
            seconds: this.calculateTime('seconds')
          })
        }
      }
    }, 1000)
  }

  calculateTime(unitOfTime) {
    switch(unitOfTime) {
      case 'days':
        return Math.floor((((this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) / 60) / 60)/ 24);
      case 'hours':
        return Math.floor(((this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) / 60) / 60) % 24;
      case 'minutes':
        return Math.floor((this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) / 60) % 60;
      case 'seconds':
        return (this.state.timeTurnWillEnd - Math.floor(new Date().getTime() / 1000)) % 60;
      default:
        throw new Error('invalid case')
    }
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe()
  }

  render() {
    const { days, hours, minutes, seconds } = this.state;

    return (
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
