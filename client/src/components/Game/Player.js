import React, { Component } from 'react';

class Player extends Component {

  getColor(status) {
    if (status < 0) {
      return '#20A812'; // Green, player has already gone
    }
    if (status === 0) {
      return '#E37907'; // Orange, waiting for player to go
    }
    return '#B40F0F'; // Red, not their turn yet
  }

  render() {
    const color = this.getColor(this.props.status);

    return (
      <div className="Player" style={{ color: color }}>
        {this.props.name}
      </div>
    );
  }
}

export default Player;

