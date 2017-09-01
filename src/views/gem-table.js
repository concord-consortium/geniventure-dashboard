import { Table, Column, ColumnGroup, Cell } from 'fixed-data-table-2';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import { ExpandCell, StudentNameCell, GemCell, ConceptCell } from './cells';
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
    return this.props.selectedRow === index ? 240 : 0;
  }

  rowExpandedGetter({rowIndex, width, height}) {
    if (!this.props.selectedRow === rowIndex) {
      return null;
    }

    const {timeSinceLastAction, idleLevel} = this.props.dataStore.getObjectAt(rowIndex, "name");
    const timeString = timeAgoString(timeSinceLastAction);

    const style = {
      height,
      width: width - 2,
    };
    return (
      <div style={style}>
        <div className={css(styles.expandStyles)}>
          <div className={css(styles.studentData)}>
            <div>
              Last seen: <span className={css(styles[idleLevel])}>{timeString}</span>
            </div>
            <div className={css(styles.padding)}>
              <img width="20px" src="https://www.umass.edu/research/sites/default/files/red_flag.jpeg" />
              <br />
              Recessive traits<br />Breeding challenges
            </div>
          </div>
          <div>
            <img src="http://i.imgur.com/9kMjESv.png" />
          </div>
        </div>
      </div>
    );
  }

  createColumns() {
    const {
      dataStore,
      selectedLevel,
      selectedMission,
      selectedChallenge,
      selectedRow

    } = this.props;
    if (!dataStore.authoring.levels) {
      return null;
    }
    const columnGroups = [];
    columnGroups.push(
      <ColumnGroup
        fixed={true}
      >
        <Column
          cell={<ExpandCell callback={this.handleExpandClick} selectedRow={selectedRow} />}
          fixed={true}
          width={30}
        />
        <Column
          columnKey="name"
          header={<Cell>Name</Cell>}
          cell={<StudentNameCell data={dataStore} />}
          fixed={true}
          width={100}
        />
      </ColumnGroup>
    );
    if (selectedChallenge === null) {
      dataStore.authoring.levels.forEach((level, i) => {
        level.missions.forEach((mission, j) => {
          const missionName = `Mission ${i + 1}.${j + 1}`;
          const columns = mission.challenges.map((challenge, k) =>
            <Column
              columnKey={JSON.stringify({level: i, mission: j, challenge: k})}
              header={
                <Cell
                  className={css(styles.clickable)}
                  onClick={() => this.handleClickChallenge(i, j, k)}>
                  {k + 1}
                </Cell>
              }
              cell={
                <GemCell data={dataStore} callback={this.handleClickGem} />
              }
              width={45}
            />
          );
          columnGroups.push(
            <ColumnGroup
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
          header={<Cell>{challengeName}</Cell>}
          flexGrow={2}
        >
          <Column
            columnKey={columnKey}
            header={<Cell>Attempts</Cell>}
            cell={<GemCell data={dataStore} showAll={true} />}
            width={45}
            flexGrow={3}
          />
          <Column
            columnKey={"concept-1"}
            header={<Cell>A</Cell>}
            cell={<ConceptCell data={dataStore} />}
            width={10}
            flexGrow={1}
          />
          <Column
            columnKey={"concept-2"}
            header={<Cell>B</Cell>}
            cell={<ConceptCell data={dataStore} />}
            width={10}
            flexGrow={1}
          />
          <Column
            columnKey={"concept-3"}
            header={<Cell>C</Cell>}
            cell={<ConceptCell data={dataStore} />}
            width={10}
            flexGrow={1}
          />
          <Column
            columnKey={"concept-4"}
            header={<Cell>D</Cell>}
            cell={<ConceptCell data={dataStore} />}
            width={10}
            flexGrow={1}
          />
        </ColumnGroup>
      );
    }

    return columnGroups;
  }

  render() {
    const {dataStore, selectedChallenge, selectedRow} = this.props;
    const columns = this.createColumns();

    return (
      <div>
        <Table
          scrollToRow={selectedRow}
          rowHeight={50}
          rowsCount={dataStore.getSize()}
          subRowHeightGetter={this.subRowHeightGetter}
          rowExpanded={this.rowExpandedGetter}
          groupHeaderHeight={selectedChallenge === null ? 45 : 0}
          headerHeight={50}
          width={selectedChallenge !== null ? 500 : 1000}
          height={500}
          {...this.props}
        >
          {columns}
        </Table>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  expandStyles: {
    display: 'flex',
    'background-color': 'white',
    border: '1px solid #d3d3d3',
    'box-sizing': 'border-box',
    padding: '20px',
    overflow: 'hidden',
    width: '100%',
    height: '100%'
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
    color: 'red'
  },
  here: {
    color: 'green'
  },
  clickable: {
    cursor: 'pointer'
  }
});

module.exports = GemTable;
