window.BezierEasing = require('bezier-easing');

//load dom or jQuery
require('./libs/dom');

require('./libs/rb-cssconfig');

require('./libs/rawblock');

/* configuration */
rb.isDebug = true;

if(!('ASSETBASEPATH' in window)){
	window.ASSETBASEPATH = '';
	rb.log('set ASSETBASEPATH to "". Please configure!');
}

//if webpack is used:
__webpack_public_path__ = window.ASSETBASEPATH + 'js/';

//require('./modules/*');

/* init after all modules are loaded or imports are configured. */
rb.life.init();





