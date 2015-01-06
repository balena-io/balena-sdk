(function() {
  var DirectoryDoesntExist, FileNotFound, InvalidConfigFile, InvalidCredentials, InvalidKey, InvalidPath, NotAny, NotFound, TypedError,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TypedError = require('typed-error');

  exports.NotFound = NotFound = (function(_super) {
    __extends(NotFound, _super);

    function NotFound(name) {
      this.message = "Couldn't find " + name;
    }

    NotFound.prototype.exitCode = 1;

    return NotFound;

  })(TypedError);

  exports.InvalidConfigFile = InvalidConfigFile = (function(_super) {
    __extends(InvalidConfigFile, _super);

    function InvalidConfigFile(file) {
      this.message = "Invalid configuration file: " + file;
    }

    InvalidConfigFile.prototype.exitCode = 1;

    return InvalidConfigFile;

  })(TypedError);

  exports.InvalidCredentials = InvalidCredentials = (function(_super) {
    __extends(InvalidCredentials, _super);

    function InvalidCredentials() {
      this.message = 'Invalid credentials';
    }

    InvalidCredentials.prototype.exitCode = 1;

    return InvalidCredentials;

  })(TypedError);

  exports.InvalidKey = InvalidKey = (function(_super) {
    __extends(InvalidKey, _super);

    function InvalidKey() {
      this.message = 'Invalid key';
    }

    InvalidKey.prototype.exitCode = 1;

    return InvalidKey;

  })(TypedError);

  exports.InvalidPath = InvalidPath = (function(_super) {
    __extends(InvalidPath, _super);

    function InvalidPath(path) {
      this.message = "Invalid path: " + path;
    }

    InvalidPath.prototype.exitCode = 1;

    return InvalidPath;

  })(TypedError);

  exports.DirectoryDoesntExist = DirectoryDoesntExist = (function(_super) {
    __extends(DirectoryDoesntExist, _super);

    function DirectoryDoesntExist(directory) {
      this.message = "Directory doesn't exist: " + directory;
    }

    DirectoryDoesntExist.prototype.exitCode = 1;

    return DirectoryDoesntExist;

  })(TypedError);

  exports.NotAny = NotAny = (function(_super) {
    __extends(NotAny, _super);

    function NotAny(name) {
      this.message = "You don't have any " + name;
    }

    NotAny.prototype.exitCode = 0;

    return NotAny;

  })(TypedError);

  exports.FileNotFound = FileNotFound = (function(_super) {
    __extends(FileNotFound, _super);

    function FileNotFound(filename) {
      this.message = "File not found: " + filename;
    }

    FileNotFound.prototype.exitCode = 1;

    return FileNotFound;

  })(TypedError);

}).call(this);
