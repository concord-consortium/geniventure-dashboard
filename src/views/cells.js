const { Cell } = require('fixed-data-table-2');
const React = require('react');
import {StyleSheet, css} from 'aphrodite';

class ExpandCell extends React.PureComponent {
  render() {
    const {data, rowIndex, columnKey, selectedRow, callback, ...props} = this.props;
    return (
      <Cell onClick={() => callback(rowIndex)} {...props}>
        <a>
          {selectedRow === rowIndex ? '\u25BC' : '\u25BA'}
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
    const {data, rowIndex, columnKey, ...props} = this.props;
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
  let text = number > 3 ? <div className="numbered-gem">{number}</div> : "";
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

    const {score, isHere} = cellData;
    let isHereStyle;
    if (isHere) {
      isHereStyle = styles.isHere;
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

class ConceptCell extends React.PureComponent {
  render() {
    const {data, rowIndex, columnKey, ...props} = this.props;
    const conceptScore = data.getObjectAt(rowIndex, columnKey);
    let value = "";
    let style = null;
    if (conceptScore < 0.3) {
      value = "x";
      style = css(styles.failedConcept);
    }
    return <div className={style}>{value}</div>;
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

