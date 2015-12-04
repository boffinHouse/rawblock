window.BezierEasing = require('bezier-easing');

//load dom or jQuery
require('./libs/rb_$');

require('./libs/rb_crucial');

require('./libs/rb_main');

/* configuration */
rb.isDebug = true;

if(!('ASSETBASEPATH' in window)){
	window.ASSETBASEPATH = '';
	rb.log('set ASSETBASEPATH to "". Please configure!');
}

//if webpack is used:
__webpack_public_path__ = window.ASSETBASEPATH + 'js/';


(function(addImportHook){
	addImportHook(['panel'], function(){
		require.ensure([], function(require){
			require('../components/rb_panel/rb_panel');
		});
	});

	addImportHook(['popover'], function(){
		require.ensure([], function(require){
			require('../components/rb_panel/rb_panel');
			require('../components/rb_popover/rb_popover');
		});
	});

	addImportHook(['panelgroup', 'tabs', 'accordion'], function(){
		require.ensure([], function(require){
			require('../components/rb_panel/rb_panel');
			require('../components/rb_panelgroup/rb_panelgroup');
		});
	});

	addImportHook(['itemscroller'], function(){
		require.ensure([], function(require){
			require('./utils/rb_draggy');
			require('../components/rb_itemscroller/rb_itemscroller');
		});
	});

	addImportHook(['dialog'], function(){
		require.ensure([], function(require){
			require('../components/rb_dialog/rb_dialog');
		});
	});


	addImportHook(['dialog'], function(){
		require.ensure([], function(require){
			require('../components/rb_dialog/rb_dialog');
		});
	});

	addImportHook(['scrolly'], function(){
		require.ensure([], function(require){
			require('../components/rb__childfx/rb__childfx');
			require('../components/rb_scrolly/rb_scrolly');
		});
	});

	addImportHook(['validate'], function(){
		require.ensure([], function(require){
			require('./utils/i18n/rb_form-de');
			require('../components/rb_form/rb_validate');
		});
	});
})(rb.life.addImportHook);

/* init after all modules are loaded or imports are configured. */
rb.life.init();





