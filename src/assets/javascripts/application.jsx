var DataApiMixin = {
  fetchData: function(url) {
    const self = this;
    $.ajax({
      url: url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        self.setState({data: data});
      },
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }
    });
  }
};

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

var UserKeys = React.createClass({
  mixins: [DataApiMixin],
  getInitialState: function() {
    return {data: {}};
  },
  componentDidMount: function() {
    this.fetchData(this.props.url);
  },
  render: function() {
    let hasInvalidKeys = (this.state.data.keys || []).length > 0;
    let showInvalidKeys = hasInvalidKeys ?
      <p>You have {this.state.data.invalid_keys_count} ssh keys, select them for update.</p> :
      <p>Congrats, you do not have invalid ssh keys.</p>;

    return (
      <div>
        <h4>SSH keys created before February 2014 immediately lose access to the organization's resources.</h4>
        {showInvalidKeys}
      </div>
    );
  }
});

var RepositoryRows = React.createClass({
  getRow: function(row) {
    return _.map(row, (v, k) => {
      let value = v
      switch(v.constructor) {
        case Array:
          value = v.map((o) => o.title).join(", ");
          break;
        default:
          value = v;
      };
      return <td key={k} className='col-xs-2 col-md-2'>{value}</td>;
    });
  },
  getRows: function(repos) {
    const self = this;
    return repos.map((row, i) => {
      return <tr key={i} data-index={i}>{self.getRow(row)}</tr>;
    });
  },
  render: function() {
    return (
      <tbody>
        {this.getRows(this.props.repos)}
      </tbody>
    );
  }
});

var RepositoryHeader = React.createClass({
  getHeader: function(repos) {
    return Object.keys(_.head(repos)).map((e, i) => {
      return <th key={i} data-field={e}>
        <div className="th-inner sortable both">{e}</div>
      </th>;
    });
  },
  render: function() {
    return (
      <thead>
        <tr>
          {this.getHeader(this.props.repos)}
        </tr>
      </thead>
    );
  }
});

var RepositoryTable = React.createClass({
  mixins: [DataApiMixin],
  getInitialState: function() {
    return {data: [
      {"id":34582,"name":"kamcaptcha","description":"A captcha plugin for Rails","created_at":"2008-07-16 12:13:51 UTC"}
    ]};
  },
  componentDidMount: function() {
    this.fetchData(this.props.url);
    $("#repositoriesTable").tablesorter();
  },
  render: function() {
    return (
      <div className="table-responsive">
        <table className="table table-striped" id="repositoriesTable" class="tablesorter">
          <RepositoryHeader repos={this.state.data}/>
          <RepositoryRows repos={this.state.data}/>
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
            <h2>Github third party app restictions</h2>
            <UserKeys url="/user" />
            <h4>Deploy keys created before February 2014 immediately lose access to the organization's resources.</h4>
            <RepositoryTable url="/deploy_keys/zendesk" />
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
