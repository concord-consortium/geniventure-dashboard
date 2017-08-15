import React, { Component } from 'react';
import addStudentDataListener from './api';

export default class App extends Component {
  componentWillMount() {
    addStudentDataListener((data) => {
      this.setState(data);
    });
  }

  render() {
    return (
      <div>
        <h1>Geniverse Dashboard</h1>
        <p>{ JSON.stringify(this.state) }</p>
      </div>
    );
  }
}
