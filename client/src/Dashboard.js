import React from 'react';
import Banner from './Banner';
import './Dashboard.css';

class Dashboard extends React.Component {
  render() {
    return (
      <div className="wrapper">
        <Banner />
        <div className="greeting">
          <p>Hi, Bob! Here are your games:</p>
        </div>
      </div>
    );
  }
}

export default Dashboard;

