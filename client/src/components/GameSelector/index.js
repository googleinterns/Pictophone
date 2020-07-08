import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css';
import './GameSelector.css';

class GameSelector extends Component {
  render() {
    return (
      <Card border="dark" style={{ width: '97.5%'}}>
        <Link to={`/game/${this.props.id}`}>
          <Card.Header>started by <b>marshall</b> on <b>06 June 2020</b></Card.Header>
          <Card.Body>
            <Card.Title>GAME 1</Card.Title>
            <Card.Text>currently <b>sherb's</b> turn (3/7)</Card.Text>
            <Card.Text><b>3</b> players to go before your turn!</Card.Text>
          </Card.Body>
        </Link>
      </Card>
    );
  }
}

export default GameSelector;
