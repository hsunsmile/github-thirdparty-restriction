import React from 'react'
import DataApiMixin from 'mixins/data_api'
import Spinner from 'react-spinkit'

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
  handleClick: function(idx) {
    let target = $(`.dropdown-menu li:nth-child(${idx}) a`);
    $(target).parents(".dropdown").find('.btn').html($(target).text() + ' <span class="caret"></span>');
    $(target).parents(".dropdown").find('.btn').val($(target).data('value'));
    if(this.props.onSelect) {
      this.props.onSelect($(target).text());
    }
  },
  items: function(items) {
    let lis = _.map(items, (i, idx) => {
      var boundClick = this.handleClick.bind(this, idx+1);
      return <li key={i} onClick={boundClick}><a href="#">{i}</a></li>
    });

    return (
      <ul className="dropdown-menu" aria-labelledby="menu">
        {lis}
      </ul>
    );
  },
  render: function() {
    let dropdownList = <Spinner spinnerName='three-bounce' noFadeIn />;

    if(!this.state.showSpinner) {
      let content = <p></p>;
      if(this.state.data.length > 0) {
        content = (
          <div>
            <button className="btn btn-primary dropdown-toggle" type="button" id="menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {this.props.title}
            <span className="caret"></span>
            </button>
            {this.items(this.state.data)}
          </div>
        );
      } else {
        content = <p>{this.props.errorMessage}</p>;
      }

      dropdownList = (
        <div className="dropdown">
          <h4>{this.props.successMessage}</h4>
          {content}
        </div>
      );
    }
    return dropdownList;
  }
});
