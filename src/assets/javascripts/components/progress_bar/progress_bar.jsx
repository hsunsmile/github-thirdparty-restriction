import React from 'react'
import Progress from 'react-progress'

module.exports = React.createClass({
  render: function() {
    let props = {
      percent: this.props.percent || 90,
      color: this.props.percent ? '#cd201f' : 'grey',
      style: {
        position: 'relative',
        display:  'block',
        boxShadow: '0px'
      }
    };

    return (
      <Progress { ...props } />
    );
  }
});
