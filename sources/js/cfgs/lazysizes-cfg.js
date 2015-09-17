require('lazysizes');
require('lazysizes/plugins/optimumx/ls.optimumx');

(function(){
	'use strict';

	window.lazySizesConfig = window.lazySizesConfig || {};
	//set expand to a higher value on larger displays
	window.lazySizesConfig.expand = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight) > 700 ? 700 : 359;
	window.lazySizesConfig.expFactor = 3;

	addEventListener('lazybeforeunveil', function(e){
		if(!e.target.getAttribute('data-optimumx') && e.target.getAttribute('data-sizes') == 'auto'){
			e.target.setAttribute('data-optimumx', 'auto');
		} else
		if(e.target.getAttribute('data-module') && e.target.matches('.lazymodule, .lazypreload')){
			e.target.classList.add('js-rb-life');
			if(window.rb && rb.life){
				rb.life.throttledFindElements();
			}
		}
	}, true);
})();

