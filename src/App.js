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
      selectedChallenge: null,
      viewingPreview: false
    };
    this.onSelectChallenge = this.onSelectChallenge.bind(this);
    this.onBackToOverview = this.onBackToOverview.bind(this);
    this.onTogglePreview = this.onTogglePreview.bind(this);
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

  onTogglePreview() {
    this.setState({
      viewingPreview: !this.state.viewingPreview
    });
  }

  render() {
    const {authoring, studentData, selectedLevel, selectedMission, selectedChallenge, viewingPreview} = this.state;
    const dataStore = new StudentDataStore(authoring, studentData);
    const title = (selectedChallenge !== null ?
      `Geniverse Dashboard: Challenge ${selectedLevel+1}.${selectedMission+1}.${selectedChallenge+1}`
      : "Geniverse Dashboard"
    );
    const topRow = (selectedChallenge !== null ?
      ( viewingPreview ?
        (
          <div style={{padding: "5px"}}>
            <a style={{padding: "15px", cursor: "pointer"}} onClick={this.onTogglePreview}>Back to table</a>
          </div>
        ) :
        (
          <div style={{padding: "5px"}}>
            <a style={{padding: "15px", cursor: "pointer"}} onClick={this.onBackToOverview}>Back to Overview</a>
            <a style={{padding: "15px", cursor: "pointer"}} onClick={this.onTogglePreview}>View challenge preview</a>
          </div>
        )
      ) :
      null
    );
    const body = (viewingPreview ?
      (
        <div>
          <iframe
            style={{width: "100%", height: "600px"}}
            src={`http://geniventure.concord.org/#/${selectedLevel+1}/${selectedMission+1}/${selectedChallenge+1}`}
          />
        </div>
      ) :
      (
        <GemTable
          dataStore={dataStore}
          selectedLevel={selectedLevel}
          selectedMission={selectedMission}
          selectedChallenge={selectedChallenge}
          onSelectChallenge={this.onSelectChallenge}
        />
      )
    );
    return (
      <div>
        <h1>{title}</h1>
        {topRow}
        {body}
      </div>
    );
  }
}
