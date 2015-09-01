(function(){
	'use strict';
	window.lazySizesConfig = window.lazySizesConfig || {};
	//set expand to a higher value on larger displays
	window.lazySizesConfig.expand = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight) > 700 ? 600 : 359;
	window.lazySizesConfig.expFactor = 3;

	document.addEventListener('lazybeforeunveil', function(e){
		if(!e.target.getAttribute('data-optimumx') && e.target.matches('picture > img, img[data-srcset]')){
			e.target.setAttribute('data-optimumx', 'auto');
		}
	}, true);
})();
