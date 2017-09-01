import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';

import addDataListener from './data/api';
import StudentDataStore from './data/student-data-store';
import GemTable from './views/gem-table';

import './css/main.css';

export default class App extends Component {

  constructor() {
    super();
    this.state = {
      authoring: {},
      studentData: {},
      className: "",
      selectedLevel: null,
      selectedMission: null,
      selectedChallenge: null,
      selectedRow: null,
      viewingPreview: false,
      time: Date.now()
    };
    this.onSelectChallenge = this.onSelectChallenge.bind(this);
    this.onBackToOverview = this.onBackToOverview.bind(this);
    this.onTogglePreview = this.onTogglePreview.bind(this);
    this.onExpandClick = this.onExpandClick.bind(this);
  }

  componentWillMount() {
    addDataListener((data) => {
      this.setState(data);
    });

    // update time state every 5 seconds to change student "last seen" state
    this.timerInterval = setInterval(() => this.setState({time: Date.now()}), 5000);
  }

  componentWillUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  onSelectChallenge(level, mission, challenge, rowIndex) {
    this.setState({
      selectedLevel: level,
      selectedMission: mission,
      selectedChallenge: challenge,
      selectedRow: rowIndex
    });
  }

  onBackToOverview() {
    this.setState({
      selectedLevel: null,
      selectedMission: null,
      selectedChallenge: null,
      selectedRow: null
    });
  }

  onTogglePreview() {
    this.setState({
      viewingPreview: !this.state.viewingPreview
    });
  }

  onExpandClick(rowIndex) {
    // toggle if select same row
    const prevRow = this.state.selectedRow;
    const selectedRow = rowIndex === prevRow ? null : rowIndex;
    this.setState({
      selectedRow
    });
  }

  renderTopRow() {
    const {
      selectedLevel, selectedMission, selectedChallenge,
      viewingPreview
    } = this.state;
    const location = selectedChallenge === null ? "Overview"
      : `Challenge ${selectedLevel + 1}.${selectedMission + 1}.${selectedChallenge + 1}`;

    let links;
    if (selectedChallenge !== null && !viewingPreview) {
      links = [
        <a style={{padding: "15px", cursor: "pointer"}} onClick={this.onBackToOverview}>Back to Overview</a>,
        <a style={{padding: "15px", cursor: "pointer"}} onClick={this.onTogglePreview}>View challenge preview</a>
      ];
    } else if (viewingPreview) {
      links = <a style={{padding: "15px", cursor: "pointer"}} onClick={this.onTogglePreview}>Back to table</a>
    }
    return (
      <div style={{padding: "5px"}}>
        <span style={{paddingRight: "10px", fontWeight: "bold"}}>{location}</span>
        {links}
      </div>
    );
  }

  render() {
    const {
      authoring,
      studentData,
      className,
      selectedLevel, selectedMission, selectedChallenge, selectedRow,
      viewingPreview,
      time
    } = this.state;

    const dataStore = new StudentDataStore(authoring, studentData, time);

    const title = [<span>Geniventure Dashboard</span>];
    if (className !== null) {
      title.push(<span className={css(styles.lighter)}>{`: ${className}`}</span>);
    }

    const topRow = this.renderTopRow(selectedChallenge, viewingPreview);

    const body = (viewingPreview ?
      (
        <div>
          <iframe
            style={{width: "100%", height: "600px"}}
            src={`https://geniventure.concord.org/#/${selectedLevel + 1}/${selectedMission + 1}/${selectedChallenge + 1}`}
          />
        </div>
      ) :
      (
        <GemTable
          dataStore={dataStore}
          selectedLevel={selectedLevel}
          selectedMission={selectedMission}
          selectedChallenge={selectedChallenge}
          selectedRow={selectedRow}
          onSelectChallenge={this.onSelectChallenge}
          onExpandClick={this.onExpandClick}
        />
      )
    );
    return (
      <div>
        <nav className={css(styles.title)}>{title}</nav>
        {topRow}
        {body}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    'background-color': '#c4e7e6',
    padding: '11px',
    color: '#3a878b',
    'font-size': '1.3em',
    'font-family': 'museo-slab,georgia,"times new roman",times,serif',
    'font-weight': "700"
  },
  lighter: {
    'font-weight': "100"
  },
  failedConcept: {
    color: 'red',
    'font-weight': 'bold',
    padding: '18px',
    'text-align': 'center'
  }
});
