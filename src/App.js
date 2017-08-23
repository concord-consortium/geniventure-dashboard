import React, { Component } from 'react';
import addDataListener from './api';

import StudentDataStore from './data/student-data-store';
import GemTable from './views/gem-table';

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
    const {authoring, studentData} = this.state;
    const dataStore = new StudentDataStore(authoring, studentData);
    return (
      <div>
        <h1>Geniverse Dashboard</h1>
        <GemTable dataStore={dataStore} />
      </div>
    );
  }
}
