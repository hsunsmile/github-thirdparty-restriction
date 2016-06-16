import React from 'react'
import Spinner from 'react-spinkit'
import DataApiMixin from 'mixins/data_api'
import ProgressBar from 'components/progress_bar/progress_bar'
import RepositoryHeader from './repository_header'
import RepositoryRows from './repository_rows'

module.exports = React.createClass({
  mixins: [DataApiMixin],
  getInitialState: function() {
    return {
      showSpinner: true,
      data: []
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
    let table = <Spinner spinnerName='chasing-dots' />;
    if(!this.state.showSpinner) {
      table = (
        <table className="table table-striped" id="repositoriesTable" class="tablesorter">
          <RepositoryHeader repos={this.state.data}/>
          <RepositoryRows repos={this.state.data}/>
        </table>
      );
    }

    return (
      <div className="table-responsive">
        <h4>Deploy keys created before February 2014 immediately lose access to the organization's resources.</h4>
        {table}
      </div>
    );
  }
});
