(function() {
  var async, errors, fs, fsPlus, gitCli, nodeify, path, settings, _,
    __slice = [].slice;

  fs = require('fs');

  fsPlus = require('fs-plus');

  _ = require('lodash');

  async = require('async');

  path = require('path');

  gitCli = require('git-cli');

  errors = require('./errors');

  settings = require('./settings');

  nodeify = function(func) {
    return function() {
      return func.call.apply(func, [null, null].concat(__slice.call(arguments)));
    };
  };

  exports.getGitDirectory = function(directory) {
    if (directory == null) {
      return;
    }
    if (!_.isString(directory)) {
      throw new Error('Invalid git directory');
    }
    return path.join(directory, '.git');
  };

  exports.getCurrentGitDirectory = function() {
    var currentDirectory;
    currentDirectory = process.cwd();
    return exports.getGitDirectory(currentDirectory);
  };

  exports.isGitRepository = function(directory, callback) {
    var gitDirectory;
    gitDirectory = exports.getGitDirectory(directory);
    return async.waterfall([
      function(callback) {
        return fs.exists(directory, nodeify(callback));
      }, function(exists, callback) {
        var error;
        if (exists) {
          return callback();
        }
        error = new errors.DirectoryDoesntExist(directory);
        return callback(error);
      }, function(callback) {
        return fsPlus.isDirectory(gitDirectory, nodeify(callback));
      }
    ], callback);
  };

  exports.getRepositoryInstance = function(directory, callback) {
    return exports.isGitRepository(directory, function(error, isGitRepository) {
      var gitDirectory, repository;
      if (error != null) {
        return callback(error);
      }
      if (!isGitRepository) {
        error = new Error("Not a git directory: " + directory);
        return callback(error);
      }
      gitDirectory = exports.getGitDirectory(directory);
      repository = new gitCli.Repository(gitDirectory);
      return callback(null, repository);
    });
  };

  exports.isValidGitApplication = function(application) {
    var gitRepository;
    gitRepository = application.git_repository;
    if (gitRepository == null) {
      return false;
    }
    if (!_.isString(gitRepository)) {
      return false;
    }
    return true;
  };

  exports.hasRemote = function(repository, name, callback) {
    return repository.listRemotes(null, function(error, remotes) {
      var hasRemote;
      if (error != null) {
        return callback(error);
      }
      hasRemote = _.indexOf(remotes, name) !== -1;
      return callback(null, hasRemote);
    });
  };

  exports.addRemote = function(repository, name, url, callback) {
    var error;
    if (!_.isString(name)) {
      error = new Error("Invalid remote name: " + name);
      return callback(error);
    }
    return repository.addRemote(name, url, callback);
  };

  exports.initProjectWithApplication = function(application, directory, callback) {
    return async.waterfall([
      function(callback) {
        var error, isValid;
        isValid = exports.isValidGitApplication(application);
        if (isValid) {
          return callback();
        }
        error = new Error("Invalid application: " + application);
        return callback(error);
      }, function(callback) {
        return exports.getRepositoryInstance(directory, callback);
      }, function(repository, callback) {
        var gitRemoteName, gitUrl;
        gitUrl = application.git_repository;
        gitRemoteName = settings.get('gitRemote');
        return exports.addRemote(repository, gitRemoteName, gitUrl, callback);
      }
    ], callback);
  };

  exports.isResinProject = function(directory, callback) {
    return async.waterfall([
      function(callback) {
        return exports.getRepositoryInstance(directory, callback);
      }, function(repository, callback) {
        var gitRemoteName;
        gitRemoteName = settings.get('gitRemote');
        return exports.hasRemote(repository, gitRemoteName, callback);
      }
    ], callback);
  };

}).call(this);
