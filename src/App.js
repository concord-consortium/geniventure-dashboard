import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import { CSSTransitionGroup } from 'react-transition-group';

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
      sortActive: true,
      selectedLevel: null,
      selectedMission: null,
      selectedChallenge: null,
      selectedRow: null,
      transitionToChallenge: false,
      viewingPreview: false,
      time: Date.now()
    };
    this.onSelectChallenge = this.onSelectChallenge.bind(this);
    this.onBackToOverview = this.onBackToOverview.bind(this);
    this.onTogglePreview = this.onTogglePreview.bind(this);
    this.onExpandClick = this.onExpandClick.bind(this);
    this.onSortActiveToggle = this.onSortActiveToggle.bind(this);
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
      selectedRow: rowIndex,
      transitionToChallenge: true
    });

    setTimeout(() => this.setState({transitionToChallenge: false}), 900);
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

  onSortActiveToggle() {
    this.setState({
      sortActive: !this.state.sortActive
    });
  }

  challengeString(separator) {
    const {selectedLevel, selectedMission, selectedChallenge} = this.state;
    return [selectedLevel + 1, selectedMission + 1, selectedChallenge + 1].join(separator);
  }

  renderTopRow() {
    const {
      selectedChallenge,
      viewingPreview
    } = this.state;
    const location = selectedChallenge === null ? "Overview"
      : `Challenge ${this.challengeString('.')}`;

    let links;
    if (selectedChallenge !== null && !viewingPreview) {
      links = <a style={{padding: "15px", cursor: "pointer"}} onClick={this.onBackToOverview}>Back to Overview</a>;
    } else if (viewingPreview) {
      links = <a style={{padding: "15px", cursor: "pointer"}} onClick={this.onTogglePreview}>Back to table</a>
    }
    return (
      <div style={{padding: "5px"}}>
        <span style={{paddingRight: "10px", fontWeight: "bold", fontSize: "1.2em"}}>{location}</span>
        {links}
      </div>
    );
  }

  renderRightPanel() {
    if (this.state.selectedChallenge === null || this.state.transitionToChallenge) {
      return null;
    }
    const {authoring, selectedLevel, selectedMission, selectedChallenge} = this.state;
    const about = authoring.levels[selectedLevel]
            .missions[selectedMission].challenges[selectedChallenge].about || {};
    const {type, description, tip} = about;
    const imgSrc = `assets/img/challenges/${this.challengeString('-')}.png`;
    setTimeout(() => this.setState({in: true}), 500);
    return (
      <div className={css(styles.rightWrapper)}>
        <div style={{backgroundColor: "rgba(255,255,255,0.7", width: "500px", height: "208px", marginBottom: "10px", position: "relative"}}>
          <div style={{fontWeight: "bold", padding: "6px"}}>{type}</div>
          <div style={{padding: "4px"}}>{description}</div>
          <div style={{fontStyle: "italic", bottom: "4px", display: "flex", position: "absolute"}}>
            {tip ? <img src="assets/img/alert.png" width="30px" style={{paddingRight: "5px", alignSelf: "center"}} alt="Tip" />
                    : null}
            {tip}
          </div>
        </div>
        <div style={{position: "relative"}}>
          <img key="img1" className={css(styles.previewImg)} width="500px" src={imgSrc} alt="Play challenge preview" />
          <CSSTransitionGroup
            transitionName="fade"
            transitionAppear={true}
            transitionAppearTimeout={800}
            transitionEnter={false}
            transitionLeave={false}
          >
            <img key="img2" className="preview-image" onClick={this.onTogglePreview} width="500px" src="assets/img/play-overlay.png" alt="Play challenge preview" />
          </CSSTransitionGroup>
        </div>
      </div>
    );
  }

  renderSortPanel() {
    return (
      <div>
        <label htmlFor="show-active">
          <input
            id="show-active"
            type="checkbox"
            checked={this.state.sortActive}
            onChange={this.onSortActiveToggle}
          />
          Sort inactive students to bottom
        </label>
      </div>
    );
  }

  render() {
    const {
      authoring,
      studentData,
      className,
      sortActive,
      selectedLevel, selectedMission, selectedChallenge, selectedRow,
      transitionToChallenge,
      viewingPreview,
      time
    } = this.state;

    const dataStore = new StudentDataStore(authoring, studentData, time, sortActive);

    const title = [<span key="title">Geniventure Dashboard</span>];
    if (className !== null) {
      title.push(<span key="className" className={css(styles.lighter)}>{`: ${className}`}</span>);
    }

    const topRow = this.renderTopRow(selectedChallenge, viewingPreview);
    const rightPanel = this.renderRightPanel();
    const sorting = this.renderSortPanel();

    const body = (viewingPreview ?
      (
        <div>
          <iframe
            style={{width: "1070px", height: "600px", marginLeft: "10px"}}
            src={`https://geniventure.concord.org/#/${this.challengeString('/')}`}
          />
        </div>
      ) :
      (
        <div className={css(styles.bodyWrapper)}>
          <GemTable
            dataStore={dataStore}
            selectedLevel={selectedLevel}
            selectedMission={selectedMission}
            selectedChallenge={selectedChallenge}
            selectedRow={selectedRow}
            transitionToChallenge={transitionToChallenge}
            onSelectChallenge={this.onSelectChallenge}
            onExpandClick={this.onExpandClick}
          />
          {rightPanel}
        </div>
      )
    );
    return (
      <div>
        <nav className={css(styles.title)}>{title}</nav>
        {topRow}
        {sorting}
        {body}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  bodyWrapper: {
    display: 'flex'
  },
  rightWrapper: {
    'padding-left': '20px',
    position: 'relative'
  },
  previewImg: {
    position: 'absolute',
    top: 0
  },
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
