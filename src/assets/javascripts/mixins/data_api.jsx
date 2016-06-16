module.exports = {
  fetchData: function(url) {
    const self = this;
    return $.ajax({
      url: url,
      dataType: 'json',
      cache: false
    });
  }
};
