import React from 'react'
import RepositoryTable from 'components/repository/repository_table'
import Dropdown from 'components/dropdown/dropdown'

module.exports = React.createClass({
  getInitialState() {
    return {
      organization: ''
    };
  },

  onSelect(organization) {
    this.setState({
      organization: organization
    });
  },

  resultsTable(type, purpose) {
    let table = <p></p>,
      organization = this.state.organization;

    if(organization.length > 0) {
      table = (
        <div className="subsection">
          <RepositoryTable organization={organization} type={type} purpose={purpose}/>
        </div>
      );
    }
    return table;
  },

  render() {
    let deployKeysTable = this.resultsTable('deploy_keys', "Deploy keys, created before February 2014,  immediately lose access to the organization's resources"),
      hooksTable = this.resultsTable('hooks', "Hooks, created after May 2014, deliveries from private organization repositories will no longer be sent to unapproved applications.");

    return (
      <div className="organization">
        <Dropdown title='Select an organization'
          errorMessage='You do not belong to any organizations.'
          successMessage='To manage your organization, select to continue'
          url={this.props.dropdownUrl} onSelect={this.onSelect} />

        {deployKeysTable}
        {hooksTable}
      </div>
    );
  }
});
