(function() {
  var fs, server, settings, url;

  url = require('url');

  fs = require('fs');

  server = require('../server');

  settings = require('../settings');

  exports.download = function(parameters, destination, callback, onProgress) {
    var downloadUrl, query;
    query = url.format({
      query: parameters
    });
    downloadUrl = url.resolve(settings.get('urls.download'), query);
    return server.request({
      method: 'GET',
      url: downloadUrl,
      pipe: fs.createWriteStream(destination)
    }, callback, onProgress);
  };

}).call(this);
