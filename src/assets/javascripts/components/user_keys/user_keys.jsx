import DataApiMixin from 'mixins/data_api'
import React from 'react'
import Spinner from 'react-spinkit'

module.exports = React.createClass({
  mixins: [DataApiMixin],
  getInitialState: function() {
    return {
      showSpinner: true,
      data: {}
    };
  },
  componentDidMount: function() {
    this.fetchData(this.props.url).done(data => {
      this.setState({
        showSpinner: false,
        data: data
      });
    });
  },
  render: function() {
    let keys = this.state.data.keys || [];
    let hasInvalidKeys = this.state.data.invalid_keys_count > 0;
    let message = <Spinner spinnerName='chasing-dots' />;

    if(!this.state.showSpinner) {
      message = hasInvalidKeys ?
        <p>You have {this.state.data.invalid_keys_count} ssh keys, select them for update.</p> :
        <p>Congrats, you do not have invalid ssh keys.</p>;
    }

    return (
      <div>
      <h4>SSH keys created before February 2014 immediately lose access to the organization's resources.</h4>
      {message}
      </div>
    );
  }
});
