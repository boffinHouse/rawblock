window.BezierEasing = require('bezier-easing');

//load dom or jQuery
require('./libs/dom');

require('./libs/rb-cssconfig');

require('./libs/rawblock');
require('./libs/rb-plugins/rb_packageloader');

/* configuration */
rb.isDebug = true;


//Begin: packageloader config
if(!('ASSETBASEPATH' in window)){
	window.ASSETBASEPATH = '';
	rb.log('set ASSETBASEPATH to "". Please configure!');
}

Object.assign(rb.packageConfig, {
	basePath: window.ASSETBASEPATH + 'js/',
	modulePath: window.ASSETBASEPATH + 'js/modules/rb_',
});


/* define loading packages for non-crucial behaviors */
/* either require modules or configure package loader */
//rb.registerPackage('moduleId/packageId', ['dependency-source.js', 'source.js']);

//End: packageloader config



/* require crucial or small/often used behaviors directly */
//require('./modules/*');

/* init after all modules are loaded or package loader is configured */
rb.life.init();





