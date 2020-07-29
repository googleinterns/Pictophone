import React, { Component } from 'react';
import { withFirebase } from '../Firebase';
import { withRouter } from 'react-router';
import { compose } from 'recompose';

class Timer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minutes: 5,
      seconds: 0,
      initialSet: false
    }
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    const game = await this.props.firebase.game(id).get();

    if(!this.state.initialSet) {
      this.setState({
        minutes: game.data().timeLimit - 1,
        seconds: 59,
        initialSet: true
      })
    }

    this.myInterval = setInterval(() => {
      const { seconds, minutes } = this.state

      if (seconds > 0) {
        this.setState(({ seconds }) => ({
          seconds: seconds - 1
        }))
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(this.myInterval)
        } else {
          this.setState(({ minutes }) => ({
            minutes: minutes - 1,
            seconds: 59
          }))
        }
      }
    }, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.myInterval);
  }


  render() {
    const { minutes, seconds } = this.state;

    return(
      <div>
          { minutes === 0 && seconds === 0
            ? <h3>Times up!</h3>
            : <h3>Time Remaining: { minutes }:{ seconds < 10 ? `0${ seconds }` : seconds }</h3>
          }
      </div>
    )
  }
}

export default compose(
  withFirebase,
  withRouter
)(Timer);
