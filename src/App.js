import React, { Component } from 'react';
import addDataListener from './api';

import GemOverview from './views/gem-overview';

export default class App extends Component {

  constructor() {
    super();
    this.state = {
      authoring: {},
      studentData: {}
    };
  }

  componentWillMount() {
    addDataListener((data) => {
      this.setState(data);
    });
  }

  render() {
    return (
      <div>
        <h1>Geniverse Dashboard</h1>
        <GemOverview authoring={this.state.authoring} studentData={this.state.studentData} />
      </div>
    );
  }
}
