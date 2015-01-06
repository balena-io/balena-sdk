(function() {
  var git;

  git = require('./git');

  exports.initProjectWithApplication = git.initProjectWithApplication;

  exports.isResinProject = git.isResinProject;

}).call(this);
