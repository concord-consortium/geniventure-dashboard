import React from 'react';
import PropTypes from 'prop-types';
import '../css/chart.css';

const Chart = ({data, width, title}) => {
  const labelWidth = 66;
  const totalWidth = width + labelWidth;
  const columns = data.map((d, i) => {
    const barLength = d.value * width;
    const color = Chart.colors[i % Chart.colors.length];
    const style = {
      width: barLength,
      backgroundColor: color
    };
    return (
      <div className="row" key={`row-${i}`}>
        <div className="label" style={{width: labelWidth}}>{d.label}</div>
        <div className="bar-wrapper" style={{width}}>
          <div className="bar" style={style} />
          <div className="tick tick-0" />
          <div className="tick tick-50" />
          <div className="tick tick-100" />
        </div>
      </div>
    );
  });

  return (
    <div className="chart" style={{width: totalWidth}}>
      <div className="title">{title}</div>
      <div className="body">
        {columns}
      </div>
    </div>
  );
};

Chart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.number
  })),
  width: PropTypes.number,
  title: PropTypes.string
};

Chart.colors = [
  "#43A19E",
  "#7B43A1",
  "#F2317A",
  "#FF9824",
  "#06B723"
];

module.exports = Chart;

