var ASSETBASEPATH = window.siteData && siteData.basePath || '';
//load dom or jQuery
require('../../_$');

require('../../_main');

rb.BezierEasing = require('bezier-easing');
//require('./utils/rb_$$');


//if webpack is used:
__webpack_public_path__ = ASSETBASEPATH + 'js/';

require('../../taskrunner/grunt/webpack/globloader!./glob.paths');

require('../../taskrunner/grunt/webpack/lazyglobloader!./lazyglob.paths');

rb.$(rb.live.init);







