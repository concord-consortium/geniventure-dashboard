import { Table, Column, ColumnGroup, Cell } from 'fixed-data-table-2';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import { CollapseCell, TextCell, GemCell, ConceptCell } from './cells';
import '../css/fixed-data-table.css';
import '../css/gem-table.css';


class GemTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollToRow: null,
      collapsedRows: new Set()
    };

    this.handleCollapseClick = this.handleCollapseClick.bind(this);
    this.subRowHeightGetter = this.subRowHeightGetter.bind(this);
    this.rowExpandedGetter = this.rowExpandedGetter.bind(this);
  }

  handleCollapseClick(rowIndex) {
    const newCollapsedRows = new Set();

    if (!this.state.collapsedRows.has(rowIndex)) {
      newCollapsedRows.add(rowIndex);
    }

    this.setState({
      scrollToRow: rowIndex,
      collapsedRows: newCollapsedRows
    });
  }

  handleClickChallenge(level, mission, challenge) {
    console.log("handle");
    this.props.onSelectChallenge(level, mission,challenge);
  }

  subRowHeightGetter(index) {
    return this.state.collapsedRows.has(index) ? 240 : 0;
  }

  rowExpandedGetter({rowIndex, width, height}) {
    if (!this.state.collapsedRows.has(rowIndex)) {
      return null;
    }

    const style = {
      height,
      width: width - 2,
    };
    return (
      <div style={style}>
        <div className={css(styles.expandStyles)}>
          <div className={css(styles.studentData)}>
            <div>
              Last seen: <span className={css(styles.justNow)}>Just now</span>
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
    const {dataStore, selectedLevel, selectedMission, selectedChallenge} = this.props;
    const {collapsedRows} = this.state;
    if (!dataStore.authoring.levels) {
      return null;
    }
    const columnGroups = [];
    columnGroups.push(
      <ColumnGroup
        fixed={true}
      >
        <Column
          cell={<CollapseCell callback={this.handleCollapseClick} collapsedRows={collapsedRows} />}
          fixed={true}
          width={30}
        />
        <Column
          columnKey="name"
          header={<Cell>Name</Cell>}
          cell={<TextCell data={dataStore} />}
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
                  onClick={() => this.handleClickChallenge(i, j, k)}>{k + 1}
                </Cell>
              }
              cell={<GemCell data={dataStore} />}
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
            header={<Cell>Concept 1</Cell>}
            cell={<ConceptCell data={dataStore} />}
            width={45}
            flexGrow={1}
          />
          <Column
            columnKey={"concept-2"}
            header={<Cell>Concept 2</Cell>}
            cell={<ConceptCell data={dataStore} />}
            width={45}
            flexGrow={1}
          />
          <Column
            columnKey={"concept-3"}
            header={<Cell>Concept 3</Cell>}
            cell={<ConceptCell data={dataStore} />}
            width={45}
            flexGrow={1}
          />
          <Column
            columnKey={"concept-4"}
            header={<Cell>Concept 4</Cell>}
            cell={<ConceptCell data={dataStore} />}
            width={45}
            flexGrow={1}
          />
        </ColumnGroup>
      );
    }

    return columnGroups;
  }

  render() {
    const {dataStore, selectedChallenge} = this.props;
    const {scrollToRow} = this.state;
    const columns = this.createColumns();

    return (
      <div>
        <Table
          scrollToRow={scrollToRow}
          rowHeight={50}
          rowsCount={dataStore.getSize()}
          subRowHeightGetter={this.subRowHeightGetter}
          rowExpanded={this.rowExpandedGetter}
          groupHeaderHeight={selectedChallenge === null ? 45 : 0}
          headerHeight={50}
          width={1000}
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
  justNow: {
    color: 'green'
  },
  clickable: {
    cursor: 'pointer'
  }
});

module.exports = GemTable;
