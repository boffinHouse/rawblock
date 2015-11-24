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

rb.life.addImportHook('modulea', function(){
	require.ensure([], function(require){
		require('./modules/module-a');
	});
});

rb.life.addImportHook('moduleb', function(){
	require.ensure([], function(require){
		require('./modules/module-b');
	});
});

rb.life.addImportHook('modulea', function(){
	require.ensure([], function(require){
		require('./modules/module-a');
	});
});

rb.life.addImportHook('modulec', function(){
	require.ensure([], function(require){
		require('./modules/module-c');
	});
});

//require('./modules/*');

/* init after all modules are loaded or imports are configured. */
rb.life.init();





