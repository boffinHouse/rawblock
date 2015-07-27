(function(){
	'use strict';
	window.lazySizesConfig = window.lazySizesConfig || {};
	//set expand to a higher value on larger displays
	window.lazySizesConfig.expand = Math.min(Math.max(document.documentElement.clientWidth, innerWidth), Math.max(document.documentElement.clientHeight, innerHeight)) > 600 ? 500 : 319;

	document.addEventListener('lazybeforeunveil', function(e){
		if(e.target.getAttribute(lazySizes.cfg.srcsetAttr) && !e.target.getAttribute('data-optimumx')){
			e.target.setAttribute('data-optimumx', 'auto');
		}
	});
})();
