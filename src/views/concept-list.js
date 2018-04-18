import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, css} from 'aphrodite';
import '../css/chart.css';

const ConceptList = ({data, title, allStudents, onToggleHelp, onShowChart}) => {
  const redConceptRows = data
    .filter(d => d.value >= 0 && d.value < 0.5)
    .sort((a, b) => a.value - b.value)
    .map((d, i) => (
      <li key={`row-${i}`} className={css(styles.concept, styles.red)}>
        {d.label.longer}
      </li>
    ));

  const yellowConceptRows = data
    .filter(d => d.value >= 0.5 && d.value < 0.8)
    .sort((a, b) => a.value - b.value)
    .map((d, i) => (
      <li key={`row-${i}`} className={css(styles.concept)}>
        {d.label.longer}
      </li>
    ));

  const single = (redConceptRows.length + yellowConceptRows.length) === 1;
  const heading = allStudents ?
    `Some students are currently struggling with the following concept${single ? ':' : 's:'}` :
    `This student is currently struggling with the following concept${single ? ':' : 's:'}`;
  const noStruggling = allStudents ?
    "On average these students are not having difficulties on any of the tracked concepts." :
    "This student is not having difficulties on any of the tracked concepts.";

  const body = redConceptRows.length + yellowConceptRows.length > 0 ? (
    <div>
      <p>{heading}</p>
      <ul>
        {redConceptRows}
        {yellowConceptRows}
      </ul>
    </div>
  ) : (
    <p>{noStruggling}</p>
  );
  return (
    <div className="chart concept-table" style={{padding: '5px', border: '1px solid #DDD'}}>
      <div className="concept-chart-top-bar">
        <div className="title">{title}</div>
        <button className="button-on-white button-narrow" onClick={onToggleHelp}>Key</button>
      </div>
      {body}
      <div>
        <button className="button-on-white" onClick={onShowChart}>View full concept chart</button>
      </div>
    </div>
  );
};

ConceptList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.shape({
      longer: PropTypes.string
    }),
    value: PropTypes.number
  })),
  title: PropTypes.string,
  allStudents: PropTypes.bool,
  onToggleHelp: PropTypes.func,
  onShowChart: PropTypes.func
};

const styles = StyleSheet.create({
  concept: {
    ':before': {
      content: "none"
    },
    'list-style-type': 'none',
    background: "url(assets/img/yellow-flag.png) 0 50% no-repeat",
    'padding-left': '42px',
    'line-height': '17px'
  },
  red: {
    background: "url(assets/img/red-flag.png) 0 50% no-repeat"
  }
});

module.exports = ConceptList;

