import { Table, Column, ColumnGroup, Cell } from 'fixed-data-table-2';
import { PortalWithState } from 'react-portal';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withSize } from 'react-sizeme';
import {StyleSheet, css} from 'aphrodite';
import { StudentNameCell, ConceptCell } from './cells';
import '../css/fixed-data-table.css';
import '../css/gem-table.css';

const headingHeight = 19;
const popupWidth = 350;

class ConceptTable extends Component {
  constructor(props) {
    super(props);

    this.subRowHeightGetter = this.subRowHeightGetter.bind(this);
    this.rowExpandedGetter = this.rowExpandedGetter.bind(this);
    this.hideConceptPopup = this.hideConceptPopup.bind(this);

    this.state = {
      stackGems: true,
      showChart: false,
      conceptPopup: null
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

  showConceptPopup(concept) {
    this.setState(previousState => ({
      conceptPopup: concept,
      newConceptPopup: (previousState.conceptPopup && previousState.conceptPopup !== concept)
    }));
  }

  hideConceptPopup() {
    if (this.state.newConceptPopup) {
      this.setState({newConceptPopup: null});
    } else {
      this.setState({conceptPopup: null});
    }
  }

  createConceptPopupContent(concept) {
    const title = concept.label.longer;
    const description = concept.label.description;
    const trait = concept.label.trait;
    const location = concept.label.location;

    if (!!trait && !!location) {
      return (
        <div>
          <h1>{title}</h1>
          <p className="concept-description">{description}</p>
          <p className="concept-trait"><strong>Trait:</strong> {trait}</p>
          <p className="concept-location"><strong>Where to find it:</strong> {location}</p>
        </div>
      );
    } else if (trait) {
      return (
        <div>
          <h1>{title}</h1>
          <p className="concept-description">{description}</p>
          <p className="concept-trait"><strong>Trait:</strong> {trait}</p>
        </div>
      );
    } else if (location) {
      return (
        <div>
          <h1>{title}</h1>
          <p className="concept-description">{description}</p>
          <p className="concept-location"><strong>Where to find it:</strong> {location}</p>
        </div>
      );
    } else {
      return (
        <div>
          <h1>{title}</h1>
          <p className="concept-description">{description}</p>
        </div>
      );
    }
  }

  createColumns() {
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
        key={concept}
        columnKey={k}
        header={
          <Cell
            id={`header-${concept.label.short}`}
            className={css(styles.clickable)}
            onClick={() => this.showConceptPopup(concept)}
            >
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
    const { size: { width: containerWidth, height: containerHeight } } = this.props;
    const columns = this.createColumns();
    const width = Math.max(containerWidth, 430);
    const height = containerHeight;

    let popup;
    if (this.state.conceptPopup && this.state.conceptPopup.label.description) {
      const concept = this.state.conceptPopup;
      popup = (
        <PortalWithState closeOnOutsideClick closeOnEsc defaultOpen onClose={this.hideConceptPopup}>
          {({ portal, isOpen, openPortal }) => {
            if (!isOpen) openPortal();
            const cell = document.getElementById(`header-${concept.label.short}`);
            const box = cell.getBoundingClientRect();
            const bodyRect = document.body.getBoundingClientRect();
            const style = {
              position: 'absolute',
              top: (box.top - bodyRect.top) + box.height + 5,
              left: ((box.left - bodyRect.left) + (box.width / 2)) - (popupWidth / 2)
            };

            let locationStyle = "";
            if (style.left < 50) {
              style.left += 50;
              locationStyle = "concept-popup-left";
            } else if (style.left > 800) {
              style.left -= 120;
              locationStyle = "concept-popup-far-right";
            } else if (style.left > 600) {
              style.left -= 50;
              locationStyle = "concept-popup-right";
            }

            return portal(
              <div style={style} className={`${css(styles.popup)} concept-popup ${locationStyle}`}>
                {this.createConceptPopupContent(concept)}
              </div>
            );
          }}
        </PortalWithState>
      );
    }

    return (
      <div className="concept-table">
        <Table
          rowHeight={50}
          rowsCount={dataStore.getSize()}
          subRowHeightGetter={this.subRowHeightGetter}
          rowExpanded={this.rowExpandedGetter}
          headerHeight={50}
          groupHeaderHeight={45}
          width={width}
          height={height}
          overflowX="auto"
          overflowY="auto"
          touchScrollEnabled={true}
          {...this.props}
        >
          {columns}
        </Table>
        {popup}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  clickable: {
    cursor: 'pointer'
  },
  popup: {
    width: popupWidth
  }
});

ConceptTable.propTypes = {
  dataStore: PropTypes.object,
  // from withSize() (React-SizeMe)
  size: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  })
};

export default withSize({ monitorWidth: true, monitorHeight: true })(ConceptTable);
