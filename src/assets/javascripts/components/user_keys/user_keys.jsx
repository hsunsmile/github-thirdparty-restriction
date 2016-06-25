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

  updateSSHKey: function(key) {
    console.log('updateSSHKey is called: ' + key.id);
  },

  keyBlock: function(key, idx, extraClassNames) {
    let updateButton = (extraClassNames === 'attention') ?
      <a className='pull-right btn btn-primary btn-mini'  href="#" role="button" onClick={this.updateSSHKey.bind(this, key)}>Update</a> :
      <span></span>;

    return (
      <div className='key-block inner' key={`keyBlock-${idx}`}>
        <div className={`highlight highlight-headers ${extraClassNames}`}>
          {updateButton}
          <div>{`Title: ${key.title}`}</div>
          <div>{`Created at: ${key.created_at}`}</div>
        </div>
        <pre className='highlight'>{key.key}</pre>
      </div>
    );
  },

  render: function() {
    let user = this.state.data;
    let validKeys = user.valid_keys || [];
    let invalidKeys = user.invalid_keys || [];
    let hasInvalidKeys = invalidKeys.length > 0;
    let message = <ProgressBar percent={this.state.progress} />;

    if(this.state.progress === 100) {
      message = hasInvalidKeys ?
        <p>{user.login}, you have {invalidKeys.length} ssh keys, select them for update.</p> :
        <p>Congrats {user.login}, you have {validKeys.length} ssh key(s) registered, none of them are invalid.</p>;
    }

    let validkeyBlocks = _.map(validKeys, (key, idx) => {
      return this.keyBlock(key, idx, 'info');
    });

    let invalidkeyBlocks = _.map(invalidKeys, (key, idx) => {
      return this.keyBlock(key, idx, 'attention');
    });

    return (
      <div>
        <h4>SSH keys created before February 2014 immediately lose access to the organization's resources.</h4>
        {message}
        {validkeyBlocks}
        {invalidkeyBlocks}
      </div>
    );
  }
});
