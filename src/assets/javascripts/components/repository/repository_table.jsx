import React from 'react'
import Timers from 'react-timers'
import DataApiMixin from 'mixins/data_api'
import ProgressBar from 'components/progress_bar/progress_bar'
import Dropdown from 'components/dropdown/dropdown'

import RepositoryHeader from './repository_header'
import RepositoryRows from './repository_rows'

module.exports = React.createClass({
  mixins: [DataApiMixin, Timers],

  getInitialState: function() {
    return {
      fetchingStatus: 'init',
      progress: 0,
      data: [],
    };
  },

  getInformation: function(url) {
    this.fetchData(url).done(data => {
      this.setState({
        fetchingStatus: 'done',
        data: data
      });
    });
  },

  getProgress: function(url) {
    if(url) {
      this.setInterval(() => {
        this.fetchData(url).done(data => {
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

  updateOrganization: function(props) {
    let organization = props.organization,
      type = props.type;

    this.setState({
      fetchingStatus: 'onGoing',
      data: []
    });

    this.getInformation(`/${type}/${organization}`);
    this.getProgress(`/progress/${type}/${organization}`);
  },

  componentDidMount: function() {
    this.updateOrganization(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    this.updateOrganization(nextProps);
  },

  informationTable: function() {
    let table = <p></p>;

    if(this.state.fetchingStatus !== 'init') {
      let content = <ProgressBar percent={this.state.progress} />;
      if(this.state.fetchingStatus === 'done') {
        if(this.state.data.length > 0) {
          content = (
            <table className="table table-striped" id="repositoriesTable" class="tablesorter">
              <RepositoryHeader repos={this.state.data}/>
              <RepositoryRows repos={this.state.data}/>
            </table>
          );
        } else {
          content = <p>Congrats! You do you have invalid deploy keys.</p>;
        }
      }

      table = (
        <div className='subsection table-responsive repository-table'>
          <h4>{this.props.purpose}</h4>
          {content}
        </div>
      );
    }
    return table;
  },

  render: function() {
    return (
      <div className="repository">
        {this.informationTable()}
      </div>
    );
  }
});
