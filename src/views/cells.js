const { Cell } = require('fixed-data-table-2');
const React = require('react');
import {StyleSheet, css} from 'aphrodite';

class ExpandCell extends React.PureComponent {
  render() {
    const { data, rowIndex, columnKey, selectedRow, callback, ...props } = this.props;
    const linkFont = { fontFamily: "'Times New Roman', Times, serif" };
    const svgDownArrow =
      <svg height="10" width="10"><polygon points="0,0 5,10 10,0" /></svg>;
    const svgRightArrow =
      <svg height="10" width="10"><polygon points="0,0 10,5 0,10" /></svg>;
    return (
      <Cell onClick={() => callback(rowIndex)} {...props}>
        <a style={linkFont}>
          {selectedRow === rowIndex ? <span className={"row-expanded"}>
            {svgDownArrow}
          </span> : <span className={"row-collapsed"}>
            {svgRightArrow}
          </span>}
        </a>
      </Cell>
    );
  }
}
module.exports.ExpandCell = ExpandCell;

class TextCell extends React.PureComponent {
  render() {
    const {data, rowIndex, columnKey, ...props} = this.props;
    return (
      <Cell {...props}>
        {data.getObjectAt(rowIndex, columnKey)}
      </Cell>
    );
  }
}
module.exports.TextCell = TextCell;

class StudentNameCell extends React.PureComponent {
  render() {
    const {data, rowIndex, columnKey, lastUpdateTime, ...props} = this.props;
    const {name, activityLevel, allStudents} = data.getObjectAt(rowIndex, columnKey);
    const className = css(
      styles[activityLevel],
      allStudents && styles.allStudents
    );

    return (
      <Cell {...props}>
        <span className={className}>{name}</span>
      </Cell>
    );
  }
}
module.exports.StudentNameCell = StudentNameCell;

const getTotalsImage = (data, multiGemColumn, transparent) => {
  const height = 40;
  const width = 20;
  const total = data.studentCount;
  const blueHeight = height * (data['0'] / total);
  const blueY = height - blueHeight;
  const goldHeight = height * (data['1'] / total);
  const goldY = height - blueHeight - goldHeight;
  const redHeight = height * (data['2'] / total);
  const redY = height - blueHeight - goldHeight - redHeight;
  const blackHeight = height * (data['3'] / total);
  const blackY = height - blueHeight - goldHeight - redHeight - blackHeight;
  const border = {
    strokeWidth: "0.25",
    stroke: "black"
  };
  let className = css(
    styles.svg,
    multiGemColumn && styles.multiGems
  );
  className += " gem-cell";
  if (transparent) {
    className += " transparent";
  }
  return (
    <div className={className}>
      <svg height={height} width={width}>
        <rect height={height} width={width} fill={"white"} {...border} />
        <rect y={blueY} height={blueHeight} width={width} fill={"#7AEAF5"} {...border} />
        <rect y={goldY} height={goldHeight} width={width} fill={"#FFFA5F"} {...border} />
        <rect y={redY} height={redHeight} width={width} fill={"#D53448"} {...border} />
        <rect y={blackY} height={blackHeight} width={width} fill={"#0D0938"} {...border} />
      </svg>
    </div>
  );
};

const getGemImage = (score, stack, number, i) => {
  if (score === undefined) {
    return <div />;
  }
  let style;
  let text = number > 2 ? <div className="numbered-gem">{number}</div> : "";
  if (score !== "...") {
    const imagePath = 'http://geniventure.concord.org/resources/fablevision/venture-pad/';
    const gemNames = ["gem_blue", "gem_yellow", "gem_red", "dark_crystal"];
    const url = `${imagePath}${gemNames[score]}.png`;
    style = {backgroundImage: `url(${url})`, backgroundSize: "22px"};
  } else {
    text = score;
  }

  let className = "gem-image";
  if (stack) {
    className += " stacked";
  }

  return <div key={i} className={className} style={style}>{text}</div>;
};

class GemCell extends React.PureComponent {
  render() {
    const {data, rowIndex, columnKey, showAll, stack, callback, transparent} = this.props;
    const cellData = data.getObjectAt(rowIndex, columnKey);
    if (!cellData) return null;

    if (cellData.studentCount) {
      return getTotalsImage(cellData, showAll, transparent);
    }

    if (cellData.score === undefined) return null;

    const {score, isHere, hadRemediation} = cellData;
    let isHereStyle;
    if (isHere) {
      if (hadRemediation > 0) {
        isHereStyle = styles.isHereWithRemediation;
      } else {
        isHereStyle = styles.isHere;
      }
    } else if (hadRemediation > 0) {
      isHereStyle = styles.hadRemediation;
    }

    if (!showAll) {
      let className = `gem-cell ${css(isHereStyle)}`;
      if (transparent) {
        className += " transparent";
      }
      return (
        <div onClick={() => callback(columnKey, rowIndex)} className={className}>
          {getGemImage(score[score.length - 1], false, score.length, 0)}
        </div>
      );
    }
    if (score.length > 4) {
      const skip = score.length - 4;
      score.splice(0, skip, "...");
    }
    const allImages = score.map((s, i) => getGemImage(s, stack, null, i));
    return (
      <div className={css(styles.multiGems, isHereStyle) + " multi-gems"}>
        {allImages}
      </div>
    );
  }
}
module.exports.GemCell = GemCell;

const conceptStyles = [
  {
    url: '/assets/img/red-flag.png',
    color: 'rgba(255,0,0,0.2)'
  },
  {
    url: '/assets/img/yellow-flag.png',
    color: 'rgba(255,243,1,0.2)'
  },
  {
    url: '/assets/img/blue-check.png',
    color: 'rgba(107,235,233,0.2)'
  }
];

class ConceptCell extends React.PureComponent {
  render() {
    const {data, rowIndex, columnKey} = this.props;
    const conceptScores = data.getObjectAt(rowIndex, "concepts");
    if (!conceptScores) {
      return null;
    }

    if (conceptScores.studentCount) {
      return getTotalsImage(conceptScores);
    }

    const score = conceptScores[columnKey] ? conceptScores[columnKey].value : NaN;
    if (isNaN(score) || score < 0) {
      return null;
    }
    const scoreCategory =
      score < 0.4 ?
        0 :
      score < 0.8 ?
        1 :
        2;

    const conceptStyle = conceptStyles[scoreCategory];

    const style = {
      backgroundImage: `url(${conceptStyle.url})`,
      backgroundSize: "29px",
      backgroundColor: conceptStyle.color
    };

    return <div className="gem-image" style={style} />;
  }
}
module.exports.ConceptCell = ConceptCell;

const styles = StyleSheet.create({
  never: {
    color: '#888'
  },
  gone: {
    color: 'black'
  },
  idle: {
    'font-style': 'italic',
    ':before': {
      content: 'url(assets/img/hourglass.svg)',
      'padding-right': '3px'
    }
  },
  here: {
    color: 'black'
  },
  allStudents: {
    'font-weight': 'bold'
  },
  isHere: {
    'background-color': '#ccf39b',
    width: "100%",
    height: "100%",
    'border-radius': '20px'
  },
  hadRemediation: {
    ':after': {
      content: '"B"',
      top: '2px',
      left: '30px',
      position: 'absolute',
      'background-color': '#FFFB',
      border: '1px solid #0006',
      'border-radius': '4px'
    }
  },
  isHereWithRemediation: {
    'background-color': '#ccf39b',
    width: "100%",
    height: "100%",
    'border-radius': '20px',
    ':after': {
      content: '"B"',
      top: '2px',
      left: '30px',
      position: 'absolute',
      'background-color': '#FFFB',
      border: '1px solid #0006',
      'border-radius': '4px'
    }
  },
  multiGems: {
    display: 'flex',
    'justify-content': 'flex-end'
  },
  failedConcept: {
    color: 'red',
    'font-weight': 'bold',
    padding: '18px',
    'text-align': 'center'
  },
  svg: {
    padding: '5px'
  }
});

