var React = require('react');

module.exports = React.createClass({
  getRow: function(row) {
    return _.map(row, (v, k) => {
      let value = v
      switch(v.constructor) {
        case Array:
        value = v.map((o) => o.title).join(", ");
        break;
        default:
          value = v;
      };
      return <td key={k} className='col-xs-2 col-md-2'>{value}</td>;
    });
  },
  getRows: function(repos) {
    const self = this;
    return repos.map((row, i) => {
      return <tr key={i} data-index={i}>{self.getRow(row)}</tr>;
    });
  },
  render: function() {
    return (
      <tbody>
      {this.getRows(this.props.repos)}
      </tbody>
    );
  }
});
