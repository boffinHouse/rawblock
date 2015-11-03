require('lazysizes');
require('lazysizes/plugins/optimumx/ls.optimumx');

(function(){
	'use strict';
	var docElem = document.documentElement;
	var addLifeClass = function(elem){
		elem.classList.add('js-rb-life');
	};

	window.lazySizesConfig = window.lazySizesConfig || {};

	if(window.rb && window.rb.cssConfig && rb.cssConfig.mqs){
		lazySizesConfig.customMedia = Object.assign(lazySizesConfig.customMedia || {}, rb.cssConfig.mqs);
	}

	//set expand to a higher value on larger displays
	window.lazySizesConfig.expand = Math.max(Math.min(docElem.clientWidth, docElem.clientHeight, 1222), 359);
	window.lazySizesConfig.expFactor = Math.min(Math.max(2000 / lazySizesConfig.expand, 2), 4);

	addEventListener('lazybeforeunveil', function(e){
		if(!e.target.getAttribute('data-optimumx') && e.target.getAttribute('data-sizes') == 'auto'){
			e.target.setAttribute('data-optimumx', 'auto');
		} else
		if(e.target.getAttribute('data-module') && e.target.matches('.lazymodule, .lazypreload')){
			e.target.classList.add('js-rb-life');
			if(window.rb && rb.life){
				rb.life.throttledFindElements();
			}
		} else
		if(e.target.classList.contains('lazymodules')){
			Array.from(e.target.querySelectorAll('.lazymodule')).forEach(addLifeClass);
			if(window.rb && rb.life){
				rb.life.throttledFindElements();
			}
		}
	}, true);
})();

