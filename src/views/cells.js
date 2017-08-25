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

const getGemImage = (gemScore) => {
  if (gemScore === -1) {
    return <div />;
  }
  const imagePath = 'http://geniventure.concord.org/resources/fablevision/venture-pad/';
  const gemNames = ["gem_blue", "gem_yellow", "gem_red", "dark_crystal"];
  const url = `${imagePath}${gemNames[gemScore]}.png`;
  const style = url ?
      {backgroundImage: `url(${url})`} :
      undefined;
  return <div className="gem-image" style={style} />;
};

class GemCell extends React.PureComponent {
  render() {
    const {data, rowIndex, columnKey, showAll, ...props} = this.props;
    const gemScore = data.getObjectAt(rowIndex, columnKey);
    if (!isNaN(gemScore) || !showAll) {
      return getGemImage(gemScore.length ? gemScore[gemScore.length - 1] : gemScore);
    }
    const allImages = gemScore.map((s) => getGemImage(s));
    return (
      <div className={css(styles.multiGems)}>
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

