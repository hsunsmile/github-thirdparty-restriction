import React from 'react'
import ReactDom from 'react-dom'
import UserKeys from 'components/user_keys/user_keys'
import RepositoryTable from 'components/repository/repository_table'

require("dashboard.scss"),
require("_bootstrap-variables.scss"),
require("bootstrap/dist/css/bootstrap.css"),
require('bootstrap-social/bootstrap-social.css');
require("font-awesome-webpack");

var NavBar = React.createClass({
  render: function() {
    return (
      <nav className="navbar navbar-inverse navbar-fixed-top">
        <div className="container-fluid">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">Third-party application restrictions</a>
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            <ul className="nav navbar-nav navbar-right">
              <li><a href="/logout">Logout</a></li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
});

var Dashboard = React.createClass({
  render: function() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-10 col-sm-offset-1 col-md-10 col-md-offset-1 main">
            <h2>Github third party app restictions</h2>
            <div className="section">
              <UserKeys url="/user" />
            </div>
            <div className="section">
              <RepositoryTable url="/deploy_keys/zendesk" progressUrl="/progress/deploy_keys" />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var Application = React.createClass({
  render: function() {
    return (
      <div>
        <NavBar />
        <Dashboard />
      </div>
    );
  }
});

if(document.getElementById('content')) {
  ReactDom.render(
    <Application />,
    document.getElementById('content')
  );
}
