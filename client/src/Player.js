import React, { Component } from 'react';

class Player extends Component {
  render() {
    return (
      <div className="Player">
        {this.props.name}
      </div>
    );
  }
}

export default Player;

