
/**
 * @module resin/vcs
 */

(function() {
  var git;

  git = require('./git');


  /**
   * initProjectWithApplication callback
   * @callback module:resin/vcs~initProjectWithApplicationCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Initialize an application project
   * @public
   * @function
   *
   * @description Add the corresponding git remote.
   * The directory should already be a git repo (maybe we should take care of git init as well here if necessary?)
   *
   * @param {Object} application - an application from resin API
   * @param {String} directory - the directory to initialize
   * @param {module:resin/vcs~initProjectWithApplicationCallback} callback - callback
   *
   * @todo This function should be better tested
   *
   * @example
   *	resin.models.application.get 91, (error, application) ->
   *		throw error if error?
   *
   *		resin.vcs.initProjectWithApplication application, 'my/new/project', (error) ->
   *			throw error if error?
   */

  exports.initProjectWithApplication = git.initProjectWithApplication;


  /**
   * isResinProject callback
   * @callback module:resin/vcs~isResinProjectCallback
   * @param {(Error|null)} error - error
   * @param {Boolean} isResinProject - is resin project
   */


  /**
   * @summary Check if an application was already initialized
   * @public
   * @function
   *
   * @description It checks if we have a resin remote added already.
   *
   * @param {String} directory - the directory
   * @param {module:resin/vcs~isResinProjectCallback} callback - callback
   *
   * @todo Find a way to test this function
   *
   * @example
   *	resin.vcs.isResinProject 'my/resin/app', (error, initialized) ->
   *		if initialized
   *			console.log('It\'s already a resin app!')
   *		else
   *			console.log('It\'s just a boring project! It should be resinified!')
   */

  exports.isResinProject = git.isResinProject;

}).call(this);
