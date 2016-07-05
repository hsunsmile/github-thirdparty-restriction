import React from 'react'
import ReactDom from 'react-dom'
import UserKeys from 'components/user_keys/user_keys'
import Orgnization from 'components/organization/organization'
import { Button } from 'react-toolbox/lib/button'

import jQuery from 'jquery/dist/jquery.js'
import Bootstrap from 'bootstrap/dist/css/bootstrap.css'
import BootstrapJS from 'bootstrap/dist/js/bootstrap.js'

import BootstrapSocial from 'bootstrap-social/bootstrap-social.css'
import FontAwesome from 'font-awesome/css/font-awesome.css'
import DashboardCSS from 'dashboard.scss'
import BootstrapVar from '_bootstrap-variables.scss'

var NavBar = React.createClass({
  render() {
    return (
      <nav className='navbar navbar-inverse navbar-fixed-top'>
        <div className='container-fluid'>
          <div className='navbar-header'>
            <a className='navbar-brand' href='#'>Third-party application restrictions</a>
          </div>
          <div id='navbar' className='navbar-collapse collapse'>
            <ul className='nav navbar-nav navbar-right'>
              <li><a href='/logout'>Logout</a></li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
});

var Dashboard = React.createClass({
  render() {
    return (
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-sm-10 col-sm-offset-1 col-md-10 col-md-offset-1 main'>
            <h2>Github third party app restictions</h2>
            <div className='section'>
              <UserKeys url='/user' updateUrl='/user_keys' />
            </div>
            <div className='section'>
              <Orgnization dropdownUrl='/organizations' />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var Application = React.createClass({
  render() {
    return (
      <div>
        <NavBar />
        <Dashboard />
      </div>
    );
  }
});

if(document.getElementById('application')) {
  ReactDom.render(
    <Application />,
    document.getElementById('application')
  );
}
