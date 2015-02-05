
/**
 * @module resin.vcs.git
 * @private
 */

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


  /**
   * @ignore
   */

  nodeify = function(func) {
    return function() {
      return func.call.apply(func, [null, null].concat(__slice.call(arguments)));
    };
  };


  /**
   * @summary Get git directory for a certain path
   * @private
   * @function
   *
   * @description By git directory, we mean the hidden .git folder that every git repository have
   * This function doesn't check if the path is valid, it only constructs it.
   *
   * @param {String} directory - the directory path
   * @throws {Error} Will throw if directory is not a string
   * @returns {String} the absolute path to the child .git directory
   *
   * @example
   *	result = getGitDirectory('/opt/projects/myapp')
   *	console.log(result)
   *	# /opt/projects/myapp/.git
   */

  exports.getGitDirectory = function(directory) {
    if (directory == null) {
      return;
    }
    if (!_.isString(directory)) {
      throw new Error('Invalid git directory');
    }
    return path.join(directory, '.git');
  };


  /**
   * @summary Get current git directory
   * @private
   * @function
   *
   * @description Get the path to the .git directory in the current directory
   * The current directory is determined by from where you ran the app
   *
   * @returns {String} the absolute path to the current directory's .git folder
   *
   * @example
   *	$ cd /Users/me/Projects/foobar && resin ...
   *	result = getCurrentGitDirectory()
   *	console.log(result)
   *	# /Users/me/Projects/foobar/.git
   */

  exports.getCurrentGitDirectory = function() {
    var currentDirectory;
    currentDirectory = process.cwd();
    return exports.getGitDirectory(currentDirectory);
  };


  /**
   * isGitRepository callback
   * @callback module:resin.vcs.git~isGitRepositoryCallback
   * @param {(Error|null)} error - error
   * @param {Boolean} isGitRepository - is git repository
   */


  /**
   * @summary Check if a directory is a git repository
   * @private
   * @function
   *
   * @param {String} directory - the directory
   * @param {module:resin.vcs.git~isGitRepositoryCallback} callback - callback
   *
   * @example
   *	isGitRepository 'my/git/repo', (error, isGitRepository) ->
   *		throw error if error?
   *		if isGitRepository
   *			console.log('Yes, it\'s a git repo!')
   *		else
   *			console.log('I should use git here!')
   */

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


  /**
   * A [git-cli](https://github.com/tuvistavie/node-git-cli) repository instance
   * @typedef {Object} GitRepository
   */


  /**
   * getRepositoryInstance callback
   * @callback module:resin.vcs.git~getRepositoryInstanceCallback
   * @param {(Error|null)} error - error
   * @param {GitRepository} gitRepository - git repository
   */


  /**
   * @summary Get repository instance
   * @private
   * @function
   *
   * @description An instance of a [gitCli](https://github.com/tuvistavie/node-git-cli) repository, for internal usage.
   *
   * @param {String} directory - the directory
   * @param {module:resin.vcs.git~getRepositoryInstanceCallback} callback - callback
   *
   * @example
   *	getRepositoryInstance 'my/git/repo', (error, repository) ->
   *		throw error if error?
   *		# I can now use gitCli functions on `repository`
   */

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


  /**
   * @summary Check if an application is a git app
   * @private
   * @function
   *
   * @description All it does is check if the application object contains a valid git_repository field.
   *
   * @param {Application} application - a resin application
   * @returns {Boolean} wheter is a valid git application or not
   *
   * @todo We should also test that the string contained in git_repository is a valid url.
   *
   * @example
   *	resin.models.application.get 91, (error, application) ->
   *		throw error if error?
   *		result = isValidGitApplication(application)
   *		console.log(result)
   *		# True
   */

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


  /**
   * hasRemote callback
   * @callback module:resin.vcs.git~hasRemoteCallback
   * @param {(Error|null)} error - error
   * @param {Boolean} hasRemote - has remote
   */


  /**
   * @summary Check if a repository has a certain remote
   * @private
   * @function
   *
   * @param {GitRepository} repository - a repository instance from getRepositoryInstance()
   * @param {String} name - the name of the remote to check for
   * @param {module:resin.vcs.git~hasRemoteCallback} callback - callback
   *
   *	@todo We should extract the logic that lists all remotes into a separate function.
   *
   * @example
   *	repository = getRepositoryInstance('my/git/repo')
   *	hasRemote repository, 'origin', (error, hasRemote) ->
   *		throw error if error?
   *		if hasRemote
   *			console.log('It has an origin remote!')
   *		else
   *			console.log('It doesn\'t has an origin remote!')
   */

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


  /**
   * addRemote callback
   * @callback module:resin.vcs.git~addRemoteCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Add a remote to a git repository
   * @private
   * @function
   *
   * @param {GitRepository} repository - a repository instance from getRepositoryInstance()
   * @param {String} name - the name of the remote to add
   * @param {String} url - url of the new remote
   * @param {module:resin.vcs.git~addRemoteCallback} callback - callback(error)
   *
   * @todo We should check the validity of all arguments.
   * @todo This function should be better tested
   *
   * @example
   *	repository = getRepositoryInstance('my/git/repo')
   *	addRemote repository, 'resin', 'git@git.resin.io:johndoe/app.git', (error) ->
   *		throw error if error?
   *
   *	$ cd my/git/repo && git remote -v
   *	resin	git@git.resin.io:johndoe/app.git (fetch)
   *	resin	git@git.resin.io:johndoe/app.git (push)
   */

  exports.addRemote = function(repository, name, url, callback) {
    var error;
    if (!_.isString(name)) {
      error = new Error("Invalid remote name: " + name);
      return callback(error);
    }
    return repository.addRemote(name, url, callback);
  };


  /**
   * initProjectWithApplication callback
   * @callback module:resin.vcs.git~initProjectWithApplicationCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Initialize an application project
   * @protected
   * @function
   *
   * @description Add the corresponding git remote.
   * The directory should already be a git repo (maybe we should take care of git init as well here if necessary?)
   *
   * @param {Application} application - a resin application
   * @param {String} directory - the directory to initialize
   * @param {module:resin.vcs.git~initProjectWithApplicationCallback} callback - callback
   *
   * @todo This function should be better tested
   *
   * @example
   *	resin.models.application.get 91, (error, application) ->
   *		throw error if error?
   *
   *		initProjectWithApplication application, 'my/new/project', (error) ->
   *			throw error if error?
   */

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


  /**
   * isResinProject callback
   * @callback module:resin.vcs.git~isResinProjectCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Check if an application was already initialized
   * @protected
   * @function
   *
   * It checks if we have a resin remote added already.
   *
   * @param {String} directory - the directory
   * @param {module:resin.vcs.git~isResinProjectCallback} callback - callback
   *
   * @todo Find a way to test this function
   *
   * @example
   *	isResinProject 'my/resin.app', (error, initialized) ->
   *		if initialized
   *			console.log('It\'s already a resin app!')
   *		else
   *			console.log('It\'s just a boring project! It should be resinified!')
   */

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
