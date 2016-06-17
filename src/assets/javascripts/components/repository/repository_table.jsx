import React from 'react'
import Timers from 'react-timers'
import DataApiMixin from 'mixins/data_api'
import ProgressBar from 'components/progress_bar/progress_bar'
import RepositoryHeader from './repository_header'
import RepositoryRows from './repository_rows'

module.exports = React.createClass({
  mixins: [DataApiMixin, Timers],
  getInitialState: function() {
    return {
      showSpinner: true,
      progress: 0,
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

    if(this.props.progressUrl) {
      this.setInterval(() => {
        this.fetchData(this.props.progressUrl).done(data => {
          this.setState({
            progress: data.progress
          });
          if(data.progress === 100) {
            this.clearIntervals();
          }
        });
      }, 500);
    }
  },
  render: function() {
    let table = <ProgressBar percent={this.state.progress} />;

    if(!this.state.showSpinner) {
      if(this.state.data.length > 0) {
        table = (
          <table className="table table-striped" id="repositoriesTable" class="tablesorter">
            <RepositoryHeader repos={this.state.data}/>
            <RepositoryRows repos={this.state.data}/>
          </table>
        );
      } else {
        table = <p>Congrats! You do you have invalid deploy keys.</p>;
      }
    }

    return (
      <div className="table-responsive">
        <h4>Deploy keys created before February 2014 immediately lose access to the organization's resources.</h4>
        {table}
      </div>
    );
  }
});
