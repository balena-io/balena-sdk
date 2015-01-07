
/**
 * @module resin/errors
 */

(function() {
  var DirectoryDoesntExist, FileNotFound, InvalidConfigFile, InvalidCredentials, InvalidKey, InvalidPath, NotAny, NotFound, TypedError,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TypedError = require('typed-error');

  exports.NotFound = NotFound = (function(_super) {
    __extends(NotFound, _super);


    /**
    	 * @summary Construct a Not Found error
    	 * @constructor
    	 *
    	 * @param {String} name - name of the thing that was not found
    	 *
    	 * @example
    	 *	throw new resin.errors.NotFound('application')
    	 *	Error: Couldn't find application
     */

    function NotFound(name) {
      this.message = "Couldn't find " + name;
    }


    /**
    	 * @member {Number} Error exit code
     */

    NotFound.prototype.exitCode = 1;

    return NotFound;

  })(TypedError);

  exports.InvalidConfigFile = InvalidConfigFile = (function(_super) {
    __extends(InvalidConfigFile, _super);


    /**
    	 * @summary Construct an Invalid Config File error
    	 * @constructor
    	 *
    	 * @param {String} file - the name of the invalid configuration file
    	 *
    	 * @example
    	 *	throw new resin.errors.InvalidConfigFile('/opt/resin.conf')
    	 *	Error: Invalid configuration file: /opt/resin.conf
     */

    function InvalidConfigFile(file) {
      this.message = "Invalid configuration file: " + file;
    }


    /**
    	 * @member {Number} Error exit code
     */

    InvalidConfigFile.prototype.exitCode = 1;

    return InvalidConfigFile;

  })(TypedError);

  exports.InvalidCredentials = InvalidCredentials = (function(_super) {
    __extends(InvalidCredentials, _super);


    /**
    	 * @summary Construct an Invalid Credentials error
    	 * @constructor
    	 *
    	 * @example
    	 *	throw new resin.errors.InvalidCredentials()
    	 *	Error: Invalid credentials
     */

    function InvalidCredentials() {
      this.message = 'Invalid credentials';
    }


    /**
    	 * @member {Number} Error exit code
     */

    InvalidCredentials.prototype.exitCode = 1;

    return InvalidCredentials;

  })(TypedError);

  exports.InvalidKey = InvalidKey = (function(_super) {
    __extends(InvalidKey, _super);


    /**
    	 * @summary Construct an Invalid Key error
    	 * @constructor
    	 *
    	 * @example
    	 *	throw new resin.errors.InvalidKey()
    	 *	Error: Invalid key
     */

    function InvalidKey() {
      this.message = 'Invalid key';
    }


    /**
    	 * @member {Number} Error exit code
     */

    InvalidKey.prototype.exitCode = 1;

    return InvalidKey;

  })(TypedError);

  exports.InvalidPath = InvalidPath = (function(_super) {
    __extends(InvalidPath, _super);


    /**
    	 * @summary Construct an Invalid Path error
    	 * @constructor
    	 *
    	 * @param {String} path - the name of the invalid path
    	 *
    	 * @example
    	 *	throw new resin.errors.InvalidPath('/tmp')
    	 *	Error: Invalid path: /tmp
     */

    function InvalidPath(path) {
      this.message = "Invalid path: " + path;
    }


    /**
    	 * @member {Number} Error exit code
     */

    InvalidPath.prototype.exitCode = 1;

    return InvalidPath;

  })(TypedError);

  exports.DirectoryDoesntExist = DirectoryDoesntExist = (function(_super) {
    __extends(DirectoryDoesntExist, _super);


    /**
    	 * @summary Construct a Directory Doesn't Exist error
    	 * @constructor
    	 *
    	 * @param {String} directory - the name of the directory that doesn't exist
    	 *
    	 * @example
    	 *	throw new resin.errors.DirectoryDoesntExist('/tmp')
    	 *	Error: Directory doesn't exist: /tmp
     */

    function DirectoryDoesntExist(directory) {
      this.message = "Directory doesn't exist: " + directory;
    }


    /**
    	 * @member {Number} Error exit code
     */

    DirectoryDoesntExist.prototype.exitCode = 1;

    return DirectoryDoesntExist;

  })(TypedError);

  exports.NotAny = NotAny = (function(_super) {
    __extends(NotAny, _super);


    /**
    	 * @summary Construct an Not Any error
    	 * @constructor
    	 *
    	 * @param {String} name - name of the thing that the user doesn't have
    	 *
    	 * @example
    	 *	throw new resin.errors.NotAny('applications')
    	 *	Error: You don't have any applications
     */

    function NotAny(name) {
      this.message = "You don't have any " + name;
    }


    /**
    	 * @member {Number} Error exit code
     */

    NotAny.prototype.exitCode = 0;

    return NotAny;

  })(TypedError);

  exports.FileNotFound = FileNotFound = (function(_super) {
    __extends(FileNotFound, _super);


    /**
    	 * @summary Construct an File Not Found error
    	 * @constructor
    	 *
    	 * @param {String} filename - name of the file that was not found
    	 *
    	 * @example
    	 *	throw new resin.errors.FileNotFound('/foo')
    	 *	Error: File not found: /foo
     */

    function FileNotFound(filename) {
      this.message = "File not found: " + filename;
    }


    /**
    	 * @member {Number} Error exit code
     */

    FileNotFound.prototype.exitCode = 1;

    return FileNotFound;

  })(TypedError);

}).call(this);
