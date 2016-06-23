import React from 'react'
import TextTruncate from 'react-text-truncate'
import Clipboard from 'clipboard'

module.exports = React.createClass({
  getRow: function(row, idx) {
    return _.map(row, (v, k) => {
      let value = v || ''
      switch(value.constructor) {
        case Array:
          value = value.map((o) => o.title).join(", ");
          break;
        default:
          value = value.toString();
      };

      let copy = <button type="button" className="btn btn-mini btn-link inline" data-clipboard-text={value}>Copy</button>;
      return (
        <td key={k} id={`${k}${idx}`} className='col-xs-2 col-md-2 repository-cell'>
          <TextTruncate
            line={5}
            truncateText="…"
            text={value}
            showTitle={true}
            textTruncateChild={copy}
            className='inline'
          />
        </td>
      );
    });
  },

  getRows: function(repos) {
    return repos.map((row, idx) => {
      return <tr key={idx} data-index={idx}>{this.getRow(row, idx)}</tr>;
    });
  },

  componentDidMount: () => {
    new Clipboard('.btn');
  },

  render: function() {
    return (
      <tbody>
        {this.getRows(this.props.repos)}
      </tbody>
    );
  }
});
