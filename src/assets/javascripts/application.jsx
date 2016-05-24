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

var Overview = React.createClass({
  render: function() {
    return (
      <div className="row placeholders">
        <div className="col-xs-6 col-sm-3 placeholder">
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="200" height="200" className="img-responsive" alt="Generic placeholder thumbnail"/>
          <h4>Label</h4>
          <span className="text-muted">Something else</span>
        </div>
        <div className="col-xs-6 col-sm-3 placeholder">
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="200" height="200" className="img-responsive" alt="Generic placeholder thumbnail"/>
          <h4>Label</h4>
          <span className="text-muted">Something else</span>
        </div>
        <div className="col-xs-6 col-sm-3 placeholder">
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="200" height="200" className="img-responsive" alt="Generic placeholder thumbnail"/>
          <h4>Label</h4>
          <span className="text-muted">Something else</span>
        </div>
        <div className="col-xs-6 col-sm-3 placeholder">
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="200" height="200" className="img-responsive" alt="Generic placeholder thumbnail"/>
          <h4>Label</h4>
          <span className="text-muted">Something else</span>
        </div>
      </div>
    );
  }
});

var RepositoryRows = React.createClass({
  render: function() {
    return (
      <tbody>
        <tr>
          <td>1,001</td>
          <td>Lorem</td>
          <td>ipsum</td>
          <td>dolor</td>
        </tr>
      </tbody>
    );
  }
});

var RepositoryHeader = React.createClass({
  headerData : function(repos) {
    return Object.keys(_.head(repos)).map(
      function(e){ return "<tr>" + e + "</tr>";}
    );
  },
  render: function() {
    return (
      <thead>
        <tr>
          {this.headerData(this.props.repos)}
        </tr>
      </thead>
    );
  }
});

var RepositoryTable = React.createClass({
  repos: [
    {"id":34582,"name":"kamcaptcha","description":"A captcha plugin for Rails","created_at":"2008-07-16 12:13:51 UTC"}
  ],
  render: function() {
    return (
      <div className="table-responsive">
        <table className="table table-striped">
          <RepositoryHeader repos={this.repos}/>
          <RepositoryRows repos={this.repos}/>
        </table>
      </div>
    );
  }
});

var Dashboard = React.createClass({
  render: function() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-10 col-sm-offset-1 col-md-10 col-md-offset-1 main">
            <h1 className="page-header">Overview</h1>
            <Overview />
            <h2 className="sub-header">Repositories</h2>
            <RepositoryTable />
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

ReactDOM.render(
  <Application />,
  document.getElementById('content')
);
