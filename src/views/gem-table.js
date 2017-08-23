import { Table, Column, ColumnGroup, Cell } from 'fixed-data-table-2';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import { CollapseCell, TextCell, GemCell } from './cells';
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

  subRowHeightGetter(index) {
    return this.state.collapsedRows.has(index) ? 80 : 0;
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
            expanded content
        </div>
      </div>
    );
  }

  createColumns() {
    const {dataStore} = this.props;
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
    dataStore.authoring.levels.forEach((level, i) => {
      level.missions.forEach((mission, j) => {
        const missionName = `Mission ${i + 1}.${j + 1}`;
        const columns = mission.challenges.map((challenge, k) =>
          <Column
            columnKey={JSON.stringify({level: i, mission: j, challenge: k})}
            header={<Cell>{k + 1}</Cell>}
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
    return columnGroups;
  }

  render() {
    const {dataStore} = this.props;
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
          groupHeaderHeight={45}
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
    'background-color': 'white',
    border: '1px solid #d3d3d3',
    'box-sizing': 'border-box',
    padding: '20px',
    overflow: 'hidden',
    width: '100%',
    height: '100%'
  }
});

module.exports = GemTable;
