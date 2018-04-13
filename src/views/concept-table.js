import { Table, Column, ColumnGroup, Cell } from 'fixed-data-table-2';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dimensions from 'react-dimensions';
import { StudentNameCell, ConceptCell } from './cells';
import '../css/fixed-data-table.css';
import '../css/gem-table.css';

const headingHeight = 19;

class ConceptTable extends Component {
  constructor(props) {
    super(props);

    this.subRowHeightGetter = this.subRowHeightGetter.bind(this);
    this.rowExpandedGetter = this.rowExpandedGetter.bind(this);

    this.state = {
      stackGems: true,
      showChart: false
    };
  }

  subRowHeightGetter(index) {
    if (this.props.dataStore.getActivityHeadingForRow(index)) {
      return headingHeight;
    }
    return 0;
  }

  rowExpandedGetter({rowIndex}) {
    if (this.props.dataStore.getActivityHeadingForRow(rowIndex)) {
      return (
        <div className="table-section-heading">
          {this.props.dataStore.getActivityHeadingForRow(rowIndex)}
        </div>
      );
    }

    return null;
  }

  createColumns() {
    console.log("create columns!")
    const {
      dataStore
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
          cell={<Cell />}
          fixed={true}
          width={30}
        />
        <Column
          columnKey="name"
          cell={<StudentNameCell data={dataStore} lastUpdateTime={dataStore.lastUpdateTime} />}
          fixed={true}
          width={100}
        />
      </ColumnGroup>
    );

    const concepts = dataStore.getObjectAt(0, "concepts") || [];

    const columns = concepts.map((concept, k) =>
      <Column
        columnKey={k}
        header={
          <Cell>
            {concept.label.short}
          </Cell>
        }
        cell={
          <ConceptCell data={dataStore} lastUpdateTime={dataStore.lastUpdateTime} />
        }
        width={90}
      />
    );

    columnGroups.push(
      <ColumnGroup
        key="concepts"
        header={<Cell>Concepts</Cell>}
      >
        {columns}
      </ColumnGroup>
    );

    return columnGroups;
  }

  render() {
    const {dataStore} = this.props;
    const {containerWidth, containerHeight} = this.props;
    const columns = this.createColumns();
    const width = Math.max(containerWidth, 430);
    const height = containerHeight;

    return (
      <div>
        <Table
          rowHeight={50}
          rowsCount={dataStore.getSize()}
          subRowHeightGetter={this.subRowHeightGetter}
          rowExpanded={this.rowExpandedGetter}
          headerHeight={50}
          groupHeaderHeight={45}
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

ConceptTable.propTypes = {
  dataStore: PropTypes.object,
  // from Dimensions
  containerWidth: PropTypes.number,
  containerHeight: PropTypes.number
};

module.exports = Dimensions({
  // elementResize: true,
  getWidth() {
    // const widthOffset = window.innerWidth < 100 ? 0 : 20;
    return window.innerWidth;
  }
})(ConceptTable);
