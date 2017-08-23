import React, { Component } from 'react';
import addDataListener from './data/api';

import StudentDataStore from './data/student-data-store';
import GemTable from './views/gem-table';

export default class App extends Component {

  constructor() {
    super();
    this.state = {
      authoring: {},
      studentData: {},
      selectedLevel: null,
      selectedMission: null,
      selectedChallenge: null
    };
    this.onSelectChallenge = this.onSelectChallenge.bind(this);
    this.onBackToOverview = this.onBackToOverview.bind(this);
  }

  componentWillMount() {
    addDataListener((data) => {
      this.setState(data);
    });
  }

  onSelectChallenge(level, mission, challenge) {
    this.setState({
      selectedLevel: level,
      selectedMission: mission,
      selectedChallenge: challenge
    });
  }

  onBackToOverview() {
    this.setState({
      selectedLevel: null,
      selectedMission: null,
      selectedChallenge: null
    });
  }

  render() {
    const {authoring, studentData, selectedLevel, selectedMission, selectedChallenge} = this.state;
    const dataStore = new StudentDataStore(authoring, studentData);
    const topRow = (selectedChallenge !== null ?
      (
        <div>
          <a onClick={this.onBackToOverview}>Back to Overview</a>
        </div>
      ) :
      null
    );
    return (
      <div>
        <h1>Geniverse Dashboard</h1>
        {topRow}
        <GemTable
          dataStore={dataStore}
          selectedLevel={selectedLevel}
          selectedMission={selectedMission}
          selectedChallenge={selectedChallenge}
          onSelectChallenge={this.onSelectChallenge}
        />
      </div>
    );
  }
}
