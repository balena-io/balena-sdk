(function() {
  var TOKEN_KEY, data;

  data = require('./data');

  TOKEN_KEY = 'token';

  exports.saveToken = function(newToken, callback) {
    return data.setText(TOKEN_KEY, newToken, callback);
  };

  exports.hasToken = function(callback) {
    return data.has(TOKEN_KEY, callback);
  };

  exports.getToken = function(callback) {
    return data.getText(TOKEN_KEY, callback);
  };

  exports.clearToken = function(callback) {
    return data.has(TOKEN_KEY, function(hasToken) {
      if (hasToken) {
        return data.remove(TOKEN_KEY, callback);
      } else {
        return typeof callback === "function" ? callback(null) : void 0;
      }
    });
  };

}).call(this);
