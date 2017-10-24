import { Table, Column, ColumnGroup, Cell } from 'fixed-data-table-2';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dimensions from 'react-dimensions';
import {StyleSheet, css} from 'aphrodite';
import { ExpandCell, StudentNameCell, GemCell, ConceptCell } from './cells';
import Chart from './chart';
import '../css/fixed-data-table.css';
import '../css/gem-table.css';

// Finishes the phrase starting with: "Last seen:"
const timeAgoString = (timeInS) => {
  if (isNaN(timeInS)) {
    return "Never";
  }
  let minutes = Math.floor(timeInS / 60);
  if (minutes < 2) {
    return "Just now";
  }
  if (minutes < 60) {
    if (minutes > 10) {
      minutes = Math.round(minutes / 5) * 5;
    }
    return `${minutes} minutes ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 20) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

class GemTable extends Component {
  constructor(props) {
    super(props);

    this.subRowHeightGetter = this.subRowHeightGetter.bind(this);
    this.rowExpandedGetter = this.rowExpandedGetter.bind(this);
    this.handleExpandClick = this.handleExpandClick.bind(this);
    this.handleClickChallenge = this.handleClickChallenge.bind(this);
    this.handleClickGem = this.handleClickGem.bind(this);
    this.state = {
      widthPercent: 100,
      stackGems: true
    };
    this.shrink = this.shrink.bind(this);
    this.grow = this.grow.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.transitionToChallenge && !nextProps.transitionToChallenge) {
      requestAnimationFrame(this.shrink);
      setTimeout(() => this.setState({stackGems: false}), 1000);
    } else if (this.props.selectedChallenge !== null && nextProps.selectedChallenge === null) {
      requestAnimationFrame(this.grow);
      this.setState({stackGems: true});
    }
  }

  shrink() {
    const widthPercent = this.state.widthPercent;
    if (widthPercent > 50) {
      this.setState({
        widthPercent: widthPercent - 5
      });
      requestAnimationFrame(this.shrink);
    }
  }

  grow() {
    const widthPercent = this.state.widthPercent;
    if (widthPercent < 100) {
      this.setState({
        widthPercent: widthPercent + 10
      });
      requestAnimationFrame(this.grow);
    }
  }

  handleExpandClick(rowIndex) {
    this.props.onExpandClick(rowIndex);
  }

  handleClickChallenge(level, mission, challenge) {
    this.props.onSelectChallenge(level, mission, challenge);
  }

  handleClickGem(column, row) {
    const col = JSON.parse(column);
    this.props.onSelectChallenge(col.level, col.mission, col.challenge, row);
  }

  subRowHeightGetter(index) {
    if (index === this.props.selectedRow) {
      if (!this.props.dataStore.getActivityHeadingForRow(index)) {
        return 288;
      }
      return 307;
    }
    if (this.props.dataStore.getActivityHeadingForRow(index)) {
      return 19;
    }
    return 0;
  }

  rowExpandedGetter({rowIndex, width, height}) {
    if (this.props.selectedRow !== rowIndex) {
      if (this.props.dataStore.getActivityHeadingForRow(rowIndex)) {
        return (
          <div className="table-section-heading">
            {this.props.dataStore.getActivityHeadingForRow(rowIndex)}
          </div>
        );
      }

      return null;
    }

    const {timeSinceLastAction, activityLevel, allStudents} = this.props.dataStore.getObjectAt(rowIndex, "name");
    const concepts = this.props.dataStore.getObjectAt(rowIndex, "concepts") || [];
    let title;
    let timeEl;
    if (!allStudents) {
      const timeString = timeAgoString(timeSinceLastAction);
      timeEl = (
        <div>
          Last seen: <span className={css(styles[activityLevel])}>{timeString}</span>
        </div>
      );
      title = "Concept understanding";
    } else {
      title = "Average concept understanding";
    }

    const style = {
      height,
      width: width - 2,
    };

    let activityHeading = null;
    if (this.props.dataStore.getActivityHeadingForRow(rowIndex)) {
      activityHeading = (
        <div className="table-section-heading">
          {this.props.dataStore.getActivityHeadingForRow(rowIndex)}
        </div>
      );
    }

    let conceptChart;
    if (concepts && Object.keys(concepts).length > 0) {
      conceptChart = (
        <Chart
          labelWidth={170}
          barWidth={300}
          data={concepts}
          title={title}
        />
      );
    } else {
      conceptChart = (
        <div className="chart" style={{width: 470, padding: '5px', border: '1px solid #DDD'}}>
          <div className="title">{title}</div>
          <div style={{padding: 20}}>
            Not enough data yet.
          </div>
        </div>
      );
    }

    return (
      <div style={style}>
        <div className={css(styles.expandStyles)}>
          <div className={css(styles.studentData)}>
            {timeEl}
            <div className={css(styles.padding)}>
              <img width="20px" src="https://www.umass.edu/research/sites/default/files/red_flag.jpeg" />
            </div>
          </div>
          <div>
            {conceptChart}
          </div>
        </div>
        {activityHeading}
      </div>
    );
  }

  createColumns() {
    const {
      dataStore,
      selectedLevel,
      selectedMission,
      selectedChallenge,
      selectedRow,
      transitionToChallenge,
    } = this.props;
    if (!dataStore.authoring.levels) {
      return null;
    }
    const columnGroups = [];
    columnGroups.push(
      <ColumnGroup
        key="student"
        fixed={true}
      >
        <Column
          cell={<ExpandCell callback={this.handleExpandClick} selectedRow={selectedRow} />}
          fixed={true}
          width={30}
        />
        <Column
          columnKey="name"
          cell={<StudentNameCell data={dataStore} lastUpdateTime={dataStore.lastUpdateTime} />}
          fixed={true}
          width={100}
          flexGrow={2}
        />
      </ColumnGroup>
    );
    if (selectedChallenge === null || transitionToChallenge) {
      let selectedChallengeString = "";
      if (transitionToChallenge) {
        selectedChallengeString = JSON.stringify({level: selectedLevel, mission: selectedMission, challenge: selectedChallenge});
      }
      dataStore.authoring.levels.forEach((level, i) => {
        level.missions.forEach((mission, j) => {
          const missionName = `Mission ${i + 1}.${j + 1}`;
          const columns = mission.challenges.map((challenge, k) => {
            const columnKey = JSON.stringify({level: i, mission: j, challenge: k});
            let transparent = false;
            if (transitionToChallenge && columnKey !== selectedChallengeString) {
              transparent = true;
            }
            return (<Column
              key={columnKey}
              columnKey={columnKey}
              header={
                <Cell
                  className={css(styles.clickable)}
                  onClick={() => this.handleClickChallenge(i, j, k)}
                >
                  {k + 1}
                </Cell>
              }
              cell={
                <GemCell data={dataStore}  lastUpdateTime={dataStore.lastUpdateTime} callback={this.handleClickGem} transparent={transparent} />
              }
              width={45}
              flexGrow={1}
            />);
          });
          columnGroups.push(
            <ColumnGroup
              key={missionName}
              header={<Cell>{missionName}</Cell>}
            >
              {columns}
            </ColumnGroup>
          );
        });
      });
    } else {
      const columnKey = JSON.stringify({
        level: selectedLevel,
        mission: selectedMission,
        challenge: selectedChallenge
      });
      const challengeName = `Challenge ${selectedLevel+1}.${selectedMission+1}.${selectedChallenge+1}`;
      columnGroups.push(
        <ColumnGroup
          key={challengeName}
          header={<Cell>{challengeName}</Cell>}
          flexGrow={2}
        >
          <Column
            columnKey={columnKey}
            header={<Cell>Attempts</Cell>}
            cell={<GemCell data={dataStore} lastUpdateTime={dataStore.lastUpdateTime} showAll={true} stack={this.state.stackGems} />}
            width={45}
            flexGrow={3}
          />
          <Column
            columnKey={"concept-1"}
            header={<Cell>Sex Det.</Cell>}
            cell={<ConceptCell data={dataStore} lastUpdateTime={dataStore.lastUpdateTime} />}
            width={10}
            flexGrow={1}
          />
          <Column
            columnKey={"concept-2"}
            header={<Cell>Simple Dom.</Cell>}
            cell={<ConceptCell data={dataStore} lastUpdateTime={dataStore.lastUpdateTime} />}
            width={10}
            flexGrow={1}
          />
          <Column
            columnKey={"concept-3"}
            header={<Cell>Reces.</Cell>}
            cell={<ConceptCell data={dataStore} lastUpdateTime={dataStore.lastUpdateTime} />}
            width={10}
            flexGrow={1}
          />
          <Column
            columnKey={"concept-4"}
            header={<Cell>Geno&ndash; Pheno</Cell>}
            cell={<ConceptCell data={dataStore} lastUpdateTime={dataStore.lastUpdateTime} />}
            width={10}
            flexGrow={1}
          />
        </ColumnGroup>
      );
    }

    return columnGroups;
  }

  render() {
    const {dataStore, selectedChallenge, selectedRow, transitionToChallenge, startSmall} = this.props;
    const {containerWidth, containerHeight} = this.props;
    let {widthPercent} = this.state;
    if (startSmall) {
      widthPercent = 50;
    }
    const columns = this.createColumns();
    const isLarge = selectedChallenge === null || transitionToChallenge;
    const width = containerWidth * (widthPercent / 100);
    const height = containerHeight;

    return (
      <div>
        <Table
          scrollToRow={selectedRow}
          rowHeight={50}
          rowsCount={dataStore.getSize()}
          subRowHeightGetter={this.subRowHeightGetter}
          rowExpanded={this.rowExpandedGetter}
          groupHeaderHeight={isLarge ? 45 : 0}
          headerHeight={50}
          width={width}
          height={height}
          {...this.props}
        >
          {columns}
        </Table>
      </div>
    );
  }
}

GemTable.propTypes = {
  dataStore: PropTypes.object,
  selectedLevel: PropTypes.number,
  selectedMission: PropTypes.number,
  selectedChallenge: PropTypes.number,
  selectedRow: PropTypes.number,
  transitionToChallenge: PropTypes.bool,
  startSmall: PropTypes.bool,
  onSelectChallenge: PropTypes.func,
  onExpandClick: PropTypes.func,
  // drom Dimensions
  containerWidth: PropTypes.number
};

const styles = StyleSheet.create({
  expandStyles: {
    display: 'flex',
    'background-color': 'white',
    border: '1px solid #d3d3d3',
    'box-sizing': 'border-box',
    padding: '20px',
    overflow: 'hidden',
    width: '100%',
    height: '288px'
  },
  padding: {
    padding: '6px'
  },
  studentData: {
    'padding-right': '20px'
  },
  gone: {
    color: 'black'
  },
  idle: {
    ':before': {
      content: "url(assets/img/hourglass.svg)"
    }
  },
  here: {
    color: 'green'
  },
  clickable: {
    cursor: 'pointer'
  }
});

module.exports = Dimensions({
  // elementResize: true,
  getWidth() {
    // const widthOffset = window.innerWidth < 100 ? 0 : 20;
    return window.innerWidth;
  }
})(GemTable);
