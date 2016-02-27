
/*
Copyright 2016 Resin.io

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

(function() {
  module.exports = {

    /**
    	 * @namespace application
    	 * @memberof resin.models
     */
    application: require('./application'),

    /**
    	 * @namespace device
    	 * @memberof resin.models
     */
    device: require('./device'),

    /**
    	 * @namespace key
    	 * @memberof resin.models
     */
    key: require('./key'),

    /**
    	 * @namespace environment-variables
    	 * @memberof resin.models
     */
    environmentVariables: require('./environment-variables'),

    /**
    	 * @namespace os
    	 * @memberof resin.models
     */
    os: require('./os'),

    /**
    	 * @namespace config
    	 * @memberof resin.models
     */
    config: require('./config'),

    /**
    	 * @namespace build
    	 * @memberof resin.models
     */
    build: require('./build')
  };

}).call(this);
