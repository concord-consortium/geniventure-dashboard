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
    const {name, idleLevel} = data.getObjectAt(rowIndex, columnKey);

    return (
      <Cell {...props}>
        <span className={css(styles[idleLevel])}>{name}</span>
      </Cell>
    );
  }
}
module.exports.StudentNameCell = StudentNameCell;

const getGemImage = (score) => {
  if (score === undefined) {
    return <div />;
  }
  const imagePath = 'http://geniventure.concord.org/resources/fablevision/venture-pad/';
  const gemNames = ["gem_blue", "gem_yellow", "gem_red", "dark_crystal"];
  const url = `${imagePath}${gemNames[score]}.png`;
  const style = url ?
      {backgroundImage: `url(${url})`} :
      undefined;
  return <div className="gem-image" style={style} />;
};

class GemCell extends React.PureComponent {
  render() {
    const {data, rowIndex, columnKey, showAll, callback} = this.props;
    const {score, isHere} = data.getObjectAt(rowIndex, columnKey);
    let isHereStyle;
    if (isHere) {
      isHereStyle = styles.isHere;
    }

    if (!showAll) {
      return (
        <div onClick={() => callback(columnKey, rowIndex)} className={css(isHereStyle)}>
          {getGemImage(score[score.length - 1])}
        </div>
      );
    }
    const allImages = score.map((s) => getGemImage(s));
    return (
      <div className={css(styles.multiGems, isHereStyle)}>
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
  gone: {
    color: 'black'
  },
  idle: {
    color: 'red'
  },
  here: {
    color: 'green'
  },
  isHere: {
    'background-color': 'gold',
    width: "100%",
    height: "100%"
  },
  multiGems: {
    display: 'flex'
  },
  failedConcept: {
    color: 'red',
    'font-weight': 'bold',
    padding: '18px',
    'text-align': 'center'
  }
});

