import { Table, Column, ColumnGroup, Cell } from 'fixed-data-table-2';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dimensions from 'react-dimensions';
import {StyleSheet, css} from 'aphrodite';
import { ExpandCell, StudentNameCell, GemCell } from './cells';
import ConceptsBarChart from './concepts-bar-chart';
import ConceptList from './concept-list';
import '../css/fixed-data-table.css';
import '../css/gem-table.css';

const headingHeight = 19;
const expandedRowHight = 325;
const challengeChartWidth = 35;

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
      stackGems: true,
      showChart: false
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
    } else if (this.props.selectedRow !== nextProps.selectedRow) {
      this.setState({showChart: false});
    }
  }

  shrink() {
    const widthPercent = this.state.widthPercent;
    if (widthPercent > challengeChartWidth) {
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
        return expandedRowHight;
      }
      return expandedRowHight + headingHeight;
    }
    if (this.props.dataStore.getActivityHeadingForRow(index)) {
      return headingHeight;
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
          Last seen:<br /><span className={css(styles[activityLevel])}>{timeString}</span>
        </div>
      );
      title = "Concept understanding";
    } else {
      title = "Average (median) concept understanding";
    }

    let activityHeading = null;
    if (this.props.dataStore.getActivityHeadingForRow(rowIndex)) {
      activityHeading = (
        <div className="table-section-heading">
          {this.props.dataStore.getActivityHeadingForRow(rowIndex)}
        </div>
      );
    }

    const tableWidth = this.props.containerWidth * (this.state.widthPercent / 100);
    const narrowAxis = tableWidth > 450 && tableWidth < 600;
    let conceptChart;
    if (concepts && Object.keys(concepts).length > 0) {
      if (this.state.showChart) {
        conceptChart = (
          <ConceptsBarChart
            labelWidth={170}
            barWidth={300}
            data={concepts}
            title={title}
            narrowAxis={narrowAxis}
            onToggleHelp={() => this.props.onToggleHelp("Concepts")}
          />
        );
      } else {
        conceptChart = (
          <ConceptList
            data={concepts}
            title={title}
            allStudents={allStudents}
            onToggleHelp={() => this.props.onToggleHelp("Concepts")}
            onShowChart={() => this.setState({showChart: true})}
          />
        );
      }
    } else {
      conceptChart = (
        <div className="chart" style={{width: "100%", padding: '5px', border: '1px solid #DDD'}}>
          <div className="title">{title}</div>
          <div style={{padding: 20}}>
            Not enough data yet.
          </div>
        </div>
      );
    }
    let fontSize = "1em";
    if (tableWidth < 490) {
      fontSize = "0.7em";
    } else if (tableWidth < 580) {
      fontSize = "0.8em";
    }

    const style = {
      height,
      width: width - 2,
      fontSize
    };

    return (
      <div style={style}>
        <div className={css(styles.expandStyles)}>
          <div className={css(styles.studentData)}>
            {timeEl}
          </div>
          <div style={{display: "flex", width: "85%"}}>
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
          flexGrow={8}
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
      widthPercent = challengeChartWidth;
    }
    const columns = this.createColumns();
    const isLarge = selectedChallenge === null || transitionToChallenge;
    const width = Math.max(containerWidth * (widthPercent / 100), 430);
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
          touchScrollEnabled={true}
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
  onToggleHelp: PropTypes.func,
  // from Dimensions
  containerWidth: PropTypes.number,
  containerHeight: PropTypes.number
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
    height: `${expandedRowHight}px`
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

export default Dimensions({
  // elementResize: true,
  getWidth() {
    // const widthOffset = window.innerWidth < 100 ? 0 : 20;
    return window.innerWidth;
  },
  elementResize: true
})(GemTable);
