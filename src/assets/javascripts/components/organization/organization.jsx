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

  resultsTable(url, purpose) {
    let table = <p></p>,
      organization = this.state.organization;

    if(organization.length > 0) {
      table = (
        <div className="subsection">
          <RepositoryTable url={url} purpose={purpose}/>
        </div>
      );
    }
    return table;
  },

  render() {
    let deployKeysInvalidUrl = `/deploy_keys/${this.state.organization}/before_2014_02`,
      deployKeysTable = this.resultsTable(deployKeysInvalidUrl, "Deploy keys, created before February 2014,  immediately lose access to the organization's resources"),
      deployKeysAfterInvalidUrl = `/deploy_keys/${this.state.organization}/after_2014_02`,
      deployKeysAfter201402Table = this.resultsTable(deployKeysAfterInvalidUrl, "Deploy keys, created by applicaitons after February 2014, immediately lose access to the organization's resources"),
      hooksUrl = `/hooks/${this.state.organization}`,
      hooksTable = this.resultsTable(hooksUrl, "Hooks, created after May 2014, deliveries from private organization repositories will no longer be sent to unapproved applications.");

    return (
      <div className="organization">
        <Dropdown title='Select an organization'
          errorMessage='You do not belong to any organizations.'
          successMessage='To manage your organization, select to continue'
          url={this.props.dropdownUrl} onSelect={this.onSelect} />

        {deployKeysTable}
        {deployKeysAfter201402Table}
        {hooksTable}
      </div>
    );
  }
});
