import React from 'react';
import PropTypes from 'prop-types';
import '../css/chart.css';

const Chart = ({data, labelWidth, barWidth, title}) => {
  const totalWidth = labelWidth + barWidth;
  const columns = data.map((d, i) => {
    const barLength = d.value * barWidth;
    let color;
    if (d.value < 0.33) {
      color = Chart.colors.low;
    } else if (d.value < 0.66) {
      color = Chart.colors.medium;
    } else {
      color = Chart.colors.high;
    }
    const style = {
      width: barLength,
      backgroundColor: color
    };
    return (
      <div className="row" key={`row-${i}`}>
        <div className="label" style={{width: labelWidth}}>{d.label.long}</div>
        <div className="bar-wrapper" style={{width: barWidth + 5}}>
          <div className="bar" style={style} />
          <div className="tick tick-0" />
          <div className="tick tick-50" />
          <div className="tick tick-100" />
        </div>
      </div>
    );
  });

  return (
    <div className="chart" style={{width: totalWidth, padding: '5px', border: '1px solid #DDD'}}>
      <div className="title">{title}</div>
      <div className="body">
        {columns}
      </div>
    </div>
  );
};

Chart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.shape({
      long: PropTypes.string,
      short: PropTypes.string
    }),
    value: PropTypes.number
  })),
  labelWidth: PropTypes.number,
  barWidth: PropTypes.number,
  title: PropTypes.string
};

Chart.colors = {
  high: "#42B9B5",
  medium: "#EADD2D",
  low: "#DA3D3D"
};

module.exports = Chart;

