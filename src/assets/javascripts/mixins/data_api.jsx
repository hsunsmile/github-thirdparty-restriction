module.exports = {
  fetchData(url) {
    return $.ajax({
      method: "GET",
      url: url,
      dataType: 'json',
      cache: false
    });
  },

  postData(url, data) {
    return $.ajax({
      method: "POST",
      url: url,
      dataType: 'json',
      data: data
    });
  },

  deleteData(url, data) {
    return $.ajax({
      method: "DELETE",
      url: url,
      dataType: 'json',
      data: data
    });
  }
};
