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

require('../components/rb_listbox/rb_listbox');

require('../components/rb_panel/rb_panel');
require('../components/rb_popover/rb_popover');
require('../components/rb_panelgroup/rb_panelgroup');

require('../components/rb_itemscroller/rb_itemscroller');
require('../components/rb_itemscroller/rb_itemscroller-pagination');
require('../components/rb_itemscroller/rb_itemscroller-player');
require('../components/rb_itemscroller/rb_itemscroller-queries');

require('../components/rb_dialog/rb_dialog');

require('../components/rb__childfx/rb__childfx');

require('../components/rb_scrolly/rb_scrolly');
require('../components/rb_sticky/rb_sticky');

require('./utils/i18n/rb_form-de');
require('../components/rb_form/rb_validate');


/* init after all modules are loaded or imports are configured. */
rb.life.init();





