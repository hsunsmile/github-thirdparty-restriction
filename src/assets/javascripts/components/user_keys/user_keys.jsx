import DataApiMixin from 'mixins/data_api'
import React from 'react'
import ProgressBar from 'components/progress_bar/progress_bar'

module.exports = React.createClass({
  mixins: [DataApiMixin],
  getInitialState: function() {
    return {
      progress: 0,
      data: {}
    };
  },
  componentDidMount: function() {
    this.fetchData(this.props.url).done(data => {
      this.setState({
        progress: 100,
        data: data
      });
    });
  },
  render: function() {
    let user = this.state.data;
    let keys = user.keys || [];
    let hasInvalidKeys = user.invalid_keys_count > 0;
    let message = <ProgressBar percent={this.state.progress} />;

    if(this.state.progress === 100) {
      message = hasInvalidKeys ?
        <p>{user.login}, you have {user.invalid_keys_count} ssh keys, select them for update.</p> :
        <p>Congrats {user.login}, you have {keys.length} ssh key(s) registered, none of them are invalid.</p>;
    }

    return (
      <div>
      <h4>SSH keys created before February 2014 immediately lose access to the organization's resources.</h4>
      {message}
      </div>
    );
  }
});
