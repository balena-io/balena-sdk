(function() {
  var ConfJS, path, settings, userHome;

  ConfJS = require('conf.js');

  path = require('path');

  userHome = require('user-home');

  settings = {
    remoteUrl: 'https://dashboard.resin.io',
    dataDirectory: path.join(userHome, '.resin')
  };

  module.exports = new ConfJS({
    userConfig: path.join(settings.dataDirectory, 'config'),
    localConfig: '.resinconf',
    "default": settings
  });

}).call(this);
