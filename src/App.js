/* global gtag */
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import { CSSTransitionGroup } from 'react-transition-group';

import addDataListener from './data/api';
import { StudentDataStore, Sorting } from './data/student-data-store';
import GemTable from './views/gem-table';
import { renderHelp } from './views/static-views';

import './css/main.css';

let gaInitialized = false;
const GAEvents = {
  OPENED_CHALLENGE: 'Opened challenge table',
  OPENED_STUDENT: 'Opened student row',
  OPENED_PREVIEW: 'Viewed challenge preview',
  OPENED_HELP: 'Viewed challenge preview',
  SORTED: 'Sorted table'
};

export default class App extends Component {

  constructor() {
    super();
    this.state = {
      authoring: {},
      studentData: {},
      className: "",
      sortActive: true,
      sort: Sorting.ALPHABETICAL,
      selectedLevel: null,
      selectedMission: null,
      selectedChallenge: null,
      selectedRow: null,
      transitionToChallenge: false,
      viewingPreview: false,
      viewingHelp: false,
      time: Date.now(),
      drawerOpen: false,
      startSmall: false
    };
    this.onSelectChallenge = this.onSelectChallenge.bind(this);
    this.onBackToOverview = this.onBackToOverview.bind(this);
    this.onTogglePreview = this.onTogglePreview.bind(this);
    this.onToggleHelp = this.onToggleHelp.bind(this);
    this.onExpandClick = this.onExpandClick.bind(this);
    this.onSortActiveToggle = this.onSortActiveToggle.bind(this);
    this.onSortChange = this.onSortChange.bind(this);
    this.onToggleDrawer = this.onToggleDrawer.bind(this);

    this.dataStore = new StudentDataStore();
  }

  componentWillMount() {
    addDataListener((data) => {
      this.setState(data);

      if (!gaInitialized && data.className) {
        const title = `Geniventure Dashboard: ${data.className}`;
        document.title = title;
        gtag('js', new Date());
        gtag('config', 'UA-106905302-1', {
          page_title: title
        });
        gaInitialized = true;
      }
    });

    // update time state every 10 seconds to change student "last seen" state
    this.timerInterval = setInterval(() => this.setState({time: Date.now()}), 10000);
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
    }, () => {
      if (gaInitialized) {
        gtag('event', GAEvents.OPENED_CHALLENGE, {
          challenge: this.challengeString(".")
        });
      }
    });

    setTimeout(() => this.setState({transitionToChallenge: false}), 1100);
  }

  onBackToOverview() {
    this.setState({
      selectedLevel: null,
      selectedMission: null,
      selectedChallenge: null,
      selectedRow: null,
      startSmall: false
    });
  }

  onTogglePreview() {
    this.setState({
      viewingPreview: !this.state.viewingPreview,
      startSmall: true
    }, () => {
      if (gaInitialized && this.state.viewingPreview) {
        gtag('event', GAEvents.OPENED_PREVIEW, {
          challenge: this.challengeString('.')
        });
      }
    });
  }

  onToggleHelp() {
    this.setState({
      viewingHelp: !this.state.viewingHelp
    }, () => {
      if (gaInitialized && this.state.viewingHelp) {
        gtag('event', GAEvents.OPENED_HELP);
      }
    });
  }

  onExpandClick(rowIndex) {
    // toggle if select same row
    const prevRow = this.state.selectedRow;
    const selectedRow = rowIndex === prevRow ? null : rowIndex;
    this.setState({
      selectedRow
    });

    if (gaInitialized) {
      gtag('event', GAEvents.OPENED_STUDENT);
    }
  }

  onSortActiveToggle() {
    this.setState({
      sortActive: !this.state.sortActive,
      selectedRow: null
    }, () => {
      if (gaInitialized) {
        gtag('event', GAEvents.SORTED, {
          by_active: this.state.sortActive
        });
      }
    });
  }

  onSortChange(evt) {
    this.setState({
      sort: evt.target.value,
      selectedRow: null
    }, () => {
      if (gaInitialized) {
        gtag('event', GAEvents.SORTED, {
          sorting: this.state.sort
        });
      }
    });
  }

  onToggleDrawer() {
    this.setState({
      drawerOpen: !this.state.drawerOpen
    });
    window.scrollTo(0, 0);
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

    let buttons;
    if (selectedChallenge !== null && !viewingPreview) {
      buttons = <button style={{marginLeft: "15px"}} onClick={this.onBackToOverview}>Back to Overview</button>;
    } else if (viewingPreview) {
      buttons = <button style={{marginLeft: "15px"}} onClick={this.onTogglePreview}>Back to table</button>;
    }
    return (
      <div className="top-row">
        <div>
          <span style={{paddingRight: "10px", fontWeight: "bold", fontSize: "1.2em"}}>{location}</span>
          {buttons}
        </div>
        <div>
          <button id="help" onClick={this.onToggleHelp}>Help</button>
        </div>
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
      <div className="right-panel-wrapper">
        <div className="description">
          <div style={{fontWeight: "bold", padding: "6px", textAlign: "center"}}>{type}</div>
          <div style={{padding: "4px"}}>{description}</div>
          <div style={{fontStyle: "italic", bottom: "4px", display: "flex", position: "absolute"}}>
            {tip ? <img src="assets/img/alert.png" width="30px" style={{paddingRight: "5px", alignSelf: "center"}} alt="Tip" />
                    : null}
            {tip}
          </div>
        </div>
        <div style={{position: "relative"}}>
          <img key="img1" className="preview-image" style={{width: "100%", maxWidth: "640px"}} src={imgSrc} alt="Play challenge preview" />
          <CSSTransitionGroup
            transitionName="fade"
            transitionAppear={true}
            transitionAppearTimeout={800}
            transitionEnter={false}
            transitionLeave={false}
          >
            <img key="img2" className="preview-image" onClick={this.onTogglePreview} style={{width: "100%", maxWidth: "640px"}} src="assets/img/play-overlay.png" alt="Play challenge preview" />
          </CSSTransitionGroup>
        </div>
      </div>
    );
  }

  renderSortPanel() {
    let drawerClassName = "drawer";
    if (this.state.drawerOpen) {
      drawerClassName += " open";
    }
    return (
      <div>
        <div className={drawerClassName}>
          <div className="drawer-contents">
            <label htmlFor="sort-struggle" style={{padding: "0 17px"}}>
              <span style={{paddingRight: "3px"}}>Sort:</span>
              <select if="sort-struggle" value={this.state.sort} onChange={this.onSortChange}>
                <option value={Sorting.ALPHABETICAL}>alphabetically</option>
                <option value={Sorting.PROGRESS}>by progress</option>
                <option value={Sorting.STRUGGLING}>by struggling students</option>
              </select>
            </label>
            <label htmlFor="show-active">
              <input
                id="show-active"
                type="checkbox"
                checked={this.state.sortActive}
                onChange={this.onSortActiveToggle}
              />
              Sort by currently-active students
            </label>
          </div>
          <div>
            <div className="tips">
              <div className="tips-title">Tip:</div>
              <div>
                You can change the <span className="tip-word">sorting</span> to &quot;progress&quot; to show the students
                who have completed the fewest challenges, or by &quot;struggling&quot; to show those students who have been
                having trouble with recent activities.
              </div>
            </div>
          </div>
        </div>
        <div className="drawer-handle-wrapper" onClick={this.onToggleDrawer}>
          <div className="drawer-handle">
            <hr />
            <hr />
            <hr />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      authoring,
      studentData,
      className,
      sortActive,
      sort,
      selectedLevel, selectedMission, selectedChallenge, selectedRow,
      transitionToChallenge,
      startSmall,
      viewingPreview,
      viewingHelp,
      time
    } = this.state;

    const title = [<span key="title">Geniventure Dashboard</span>];
    if (className !== null) {
      title.push(<span key="className" className={css(styles.lighter)}>{`: ${className}`}</span>);
    }

    const topRow = this.renderTopRow(selectedChallenge, viewingPreview);
    const rightPanel = this.renderRightPanel();
    const sorting = this.renderSortPanel();
    const help = viewingHelp ? renderHelp(this.onToggleHelp) : null;
    const modalOverlay = viewingHelp ? <div id="modal-overlay" onClick={this.onToggleHelp} /> : null;

    this.dataStore.update(
      authoring,
      studentData,
      time,
      sortActive,
      sort);

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
            dataStore={this.dataStore}
            selectedLevel={selectedLevel}
            selectedMission={selectedMission}
            selectedChallenge={selectedChallenge}
            selectedRow={selectedRow}
            transitionToChallenge={transitionToChallenge}
            startSmall={startSmall}
            onSelectChallenge={this.onSelectChallenge}
            onExpandClick={this.onExpandClick}
            onToggleHelp={this.onToggleHelp}
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
        {help}
        {modalOverlay}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  bodyWrapper: {
    display: 'flex'
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
