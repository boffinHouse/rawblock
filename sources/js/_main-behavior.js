window.BezierEasing = require('bezier-easing');

//load dom or jQuery
require('./libs/dom');

//require('./libs/rb-cssconfig');

require('./libs/rawblock');
require('./libs/rb-plugins/rb_packageloader');

/* configuration */
rb.isDebug = true;

if(!('ASSETBASEPATH' in window)){
	window.ASSETBASEPATH = '';
	rb.log('set ASSETBASEPATH to "". Please configure!');
}

//if webpack is used:
__webpack_public_path__ = window.ASSETBASEPATH + 'js/';


/* require crucial or small/often used behaviors directly */
//require('./modules/*');

/* init after all modules are loaded or package loader is configured */
rb.life.init();





