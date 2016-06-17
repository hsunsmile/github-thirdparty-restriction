import React from 'react'
import Progress from 'react-progress'
import Spinner from 'react-spinkit'

module.exports = React.createClass({
  render: function() {
    let props = {
      percent: this.props.percent || 0,
      color: '#cd201f',
      style: {
        position: 'relative',
        display:  'block',
        boxShadow: '0px'
      }
    };

    return (
      <div>
        <Progress { ...props } />
        <Spinner spinnerName='three-bounce' noFadeIn />
      </div>
    );
  }
});
