
/**
 * @namespace resin
 */

(function() {
  module.exports = {

    /**
    	 * @memberof resin
    	 * @see {@link resin.models}
     */
    models: require('./models'),

    /**
    	 * @memberof resin
    	 * @see {@link module:resin/data}
     */
    data: require('./data'),

    /**
    	 * @memberof resin
    	 * @see {@link module:resin/auth}
     */
    auth: require('./auth'),

    /**
    	 * @memberof resin
    	 * @see {@link module:resin/vcs}
     */
    vcs: require('./vcs'),

    /**
    	 * @memberof resin
    	 * @see {@link module:resin/settings}
     */
    settings: require('./settings'),

    /**
    	 * @memberof resin
    	 * @see {@link module:resin/connection}
     */
    connection: require('./connection')
  };

}).call(this);
