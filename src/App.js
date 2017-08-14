import React, { Component } from 'react';

export default class App extends Component {
  render() {
    return (
      <div>
        <h1>Geniverse Dashboard</h1>
        <p>{ JSON.stringify(this.props) }</p>
      </div>
    );
  }
}
