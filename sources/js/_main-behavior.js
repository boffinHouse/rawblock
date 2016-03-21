window.BezierEasing = require('bezier-easing');

var ASSETBASEPATH = window.siteData && siteData.basePath || '';
//load dom or jQuery
require('./libs/rb_$');

require('./libs/rb_crucial');

require('./libs/rb_main');

/* configuration */
rb.isDebug = true;
rb.life.autoStart = false;

//if webpack is used:
__webpack_public_path__ = ASSETBASEPATH + 'js/';

require('../../taskrunner/grunt/webpack/globloader!./glob.paths');

require('../../taskrunner/grunt/webpack/lazyglobloader!./lazyglob.paths');


/* init after all modules are loaded or imports are configured. */
setTimeout(rb.life.init);





