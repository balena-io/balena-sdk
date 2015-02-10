
/**
 * @namespace resin.models
 */

(function() {
  module.exports = {

    /**
    	 * @memberof resin.models
    	 * @see {@link module:resin.models.application}
     */
    application: require('./application'),

    /**
    	 * @memberof resin.models
    	 * @see {@link module:resin.models.device}
     */
    device: require('./device'),

    /**
    	 * @memberof resin.models
    	 * @see {@link module:resin.models.key}
     */
    key: require('./key'),

    /**
    	 * @memberof resin.models
    	 * @see {@link module:resin.models.environment-variables}
     */
    environmentVariables: require('./environment-variables'),

    /**
    	 * @memberof resin.models
    	 * @see {@link module:resin.models.os}
     */
    os: require('./os'),

    /**
    	 * @memberof resin.models
    	 * @see {@link module:resin.models.config}
     */
    config: require('./config')
  };

}).call(this);
