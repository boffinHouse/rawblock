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

require('../components/bla/bla');

(function(addImportHook){

	addImportHook(['listbox'], function(){
		require.ensure([], function(require){
			require('../components/rb_listbox/rb_listbox');
		});
	});

	addImportHook(['panel', 'panelbutton'], function(){
		require.ensure([], function(require){
			require('../components/rb_panel/rb_panel');
		});
	});

	addImportHook(['popover'], function(){
		require.ensure([], function(require){
			require('../components/rb_popover/rb_popover');
		});
	});

	addImportHook(['panelgroup', 'tabs', 'accordion'], function(){
		require.ensure([], function(require){
			require('../components/rb_panelgroup/rb_panelgroup');
		});
	});

	addImportHook(['itemscroller'], function(){
		require.ensure([], function(require){
			require('../components/rb_itemscroller/rb_itemscroller');
			require('../components/rb_itemscroller/rb_itemscroller-pagination');
			require('../components/rb_itemscroller/rb_itemscroller-player');
			require('../components/rb_itemscroller/rb_itemscroller-queries');
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

	addImportHook(['sticky'], function(){
		require.ensure([], function(require){
			require('../components/rb__childfx/rb__childfx');
			require('../components/rb_sticky/rb_sticky');
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





