import React from 'react';
import PropTypes from 'prop-types';
import '../css/chart.css';

const Chart = ({data, labelWidth, barWidth, title}) => {
  const totalWidth = labelWidth + barWidth;
  const rows = data.map((d, i) => {
    const barLength = d.value * barWidth;
    let unseen = false;
    let color;
    if (d.value < 0.33) {
      color = Chart.colors.low;
    } else if (d.value < 0.66) {
      color = Chart.colors.medium;
    } else {
      color = Chart.colors.high;
    }
    if (d.value === -1 || isNaN(d.value)) {
      unseen = true;
    }
    const barStyle = {
      width: barLength,
      backgroundColor: color.bar,
      borderColor: color.border
    };
    const labelStyle = {
      width: labelWidth
    };
    if (unseen) {
      barStyle.width = "0";
      barStyle.border = "0";
      labelStyle.color = "#999";
    }

    return (
      <div className="row" key={`row-${i}`}>
        <div className="label" style={labelStyle}>{d.label.long}</div>
        <div className="bar-wrapper" style={{width: barWidth + 10}}>
          <div className="bar" style={barStyle} />
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
        {rows}
      </div>
      <div className="x-axis">
        <div>Low</div>
        <div>Medium</div>
        <div>High</div>
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
  high: {
    bar: "#7AEAF5",
    border: "#5ee6f3"
  },
  medium: {
    bar: "#FFFA5F",
    border: "#e6de00"
  },
  low: {
    bar: "#D53448",
    border: "#be2739"
  }
};

module.exports = Chart;

