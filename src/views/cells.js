const { Cell } = require('fixed-data-table-2');
const React = require('react');

class CollapseCell extends React.PureComponent {
  render() {
    const {data, rowIndex, columnKey, collapsedRows, callback, ...props} = this.props;
    return (
      <Cell {...props}>
        <a onClick={() => callback(rowIndex)}>
          {collapsedRows.has(rowIndex) ? '\u25BC' : '\u25BA'}
        </a>
      </Cell>
    );
  }
}
module.exports.CollapseCell = CollapseCell;

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

class GemCell extends React.PureComponent {
  render() {
    const {data, rowIndex, columnKey, ...props} = this.props;
    const gemScore = data.getObjectAt(rowIndex, columnKey);
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
  }
}
module.exports.GemCell = GemCell;

