import React from 'react'
import Timers from 'react-timers'
import DataApiMixin from 'mixins/data_api'
import ProgressBar from 'components/progress_bar/progress_bar'
import Dropdown from 'components/dropdown/dropdown'

import RepositoryHeader from './repository_header'
import RepositoryRows from './repository_rows'

module.exports = React.createClass({
  mixins: [DataApiMixin, Timers],

  getInitialState() {
    return {
      fetchingStatus: 'init',
      progress: 0,
      data: [],
      error: null
    };
  },

  getInformation(url) {
    if(url) {
      this.setInterval(() => {
        this.fetchData(url).done(data => {
          this.setState({
            data: data.results,
            progress: data.progress,
            error: data.error
          });
          if(data.progress === 100 || data.error) {
            this.clearIntervals();
          }
        });
      }, 1000);
    }
  },

  updateOrganization(props) {
    let url = props.url;

    this.clearTimers();
    this.setState({
      progress: 0,
      fetchingStatus: 'onGoing',
      data: [],
      error: null
    });

    this.getInformation(url);
  },

  componentDidMount() {
    this.updateOrganization(this.props);
  },

  componentWillReceiveProps(nextProps) {
    this.updateOrganization(nextProps);
  },

  informationTable() {
    let table = <p></p>;

    if(this.state.fetchingStatus !== 'init') {
      let content = <ProgressBar percent={this.state.progress} />;

      if(this.state.progress === 100 || this.state.error) {
        if(this.state.data.length > 0) {
          content = (
            <table className="table table-striped" id="repositoriesTable" class="tablesorter">
              <RepositoryHeader repos={this.state.data}/>
              <RepositoryRows repos={this.state.data}/>
            </table>
          );
        } else {
          content = <p>Congrats! You do you have invalid deploy keys.</p>;

          if(this.state.error) {
            content = (
              <div className="subsection bg-warning">
                <h6>Failed to perform API requests, you might not have right permissions.</h6>
                <pre>{this.state.error}</pre>
              </div>
            );
          }
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

  render() {
    return (
      <div className="repository">
        {this.informationTable()}
      </div>
    );
  }
});
