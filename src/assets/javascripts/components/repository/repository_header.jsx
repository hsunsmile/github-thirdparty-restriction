var React = require('react'),
  ProgressBar = require('components/progress_bar/progress_bar');

module.exports = React.createClass({
  getHeader: function(repos) {
    return Object.keys(_.head(repos) || {}).map((e, i) => {
      return (
        <th key={i} data-field={e}>
          <div className="th-inner sortable both">{e}</div>
        </th>
      );
    });
  },
  render: function() {
    return (
      <thead>
        <tr>
        {this.getHeader(this.props.repos)}
        </tr>
      </thead>
    );
  }
});
