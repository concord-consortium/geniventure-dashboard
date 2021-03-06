import React from 'react';
import PropTypes from 'prop-types';
import '../css/chart.css';

const ConceptsBarChart = ({data, labelWidth, barWidth, title, narrowAxis, onToggleHelp}) => {
  const totalWidth = labelWidth + barWidth;
  const rows = data.map((d, i) => {
    const barLength = Math.max(Math.min(d.value * 100, 99.2), 2);
    let unseen = false;
    let color;
    if (d.value < 0.4) {
      color = ConceptsBarChart.colors.low;
    } else if (d.value < 0.8) {
      color = ConceptsBarChart.colors.medium;
    } else {
      color = ConceptsBarChart.colors.high;
    }
    if (d.value === -1 || isNaN(d.value)) {
      unseen = true;
    }
    const barStyle = {
      width: `${barLength}%`,
      backgroundColor: color.bar,
      borderColor: color.border
    };
    const barWrapperStyle = {
      width: "100%",
      maxWidth: barWidth + 10
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
        <div className="bar-wrapper" style={barWrapperStyle}>
          <div className="bar" style={barStyle} />
          <div className="tick tick-0" />
          <div className="tick tick-50" />
          <div className="tick tick-100" />
        </div>
      </div>
    );
  });

  const xAxisClass = narrowAxis ? "x-axis narrow" : "x-axis";
  return (
    <div className="chart" style={{width: totalWidth, padding: '5px', border: '1px solid #DDD'}}>
      <div className="concept-chart-top-bar">
        <div className="title">{title}</div>
        <button className="button-on-white button-narrow" onClick={onToggleHelp}>HELP</button>
      </div>
      <div className="body">
        {rows}
      </div>
      <div className={xAxisClass}>
        <div>Low</div>
        <div>Medium</div>
        <div>High</div>
      </div>
    </div>
  );
};

ConceptsBarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.shape({
      long: PropTypes.string,
      short: PropTypes.string
    }),
    value: PropTypes.number
  })),
  labelWidth: PropTypes.number,
  barWidth: PropTypes.number,
  title: PropTypes.string,
  narrowAxis: PropTypes.bool,
  onToggleHelp: PropTypes.func
};

ConceptsBarChart.colors = {
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

export default ConceptsBarChart;
