require('lazysizes');
require('lazysizes/plugins/optimumx/ls.optimumx');
//require('lazysizes/plugins/parent-fit/ls.parent-fit');

(function (window) {
    'use strict';
    var rb = window.rb;
    var lazySizesConfig = window.lazySizesConfig || {};

    lazySizesConfig.hFac = 1;
    lazySizesConfig.constrainPixelDensity = true;

    if(!window.lazySizesConfig){
        window.lazySizesConfig = lazySizesConfig;
    }

    function configureMediaQueries(){
        document.removeEventListener('lazyunveilread', configureMediaQueries);
        Object.assign(lazySizesConfig.customMedia, rb.cssConfig.mqs);
    }

    document.addEventListener('lazyunveilread', configureMediaQueries);

    document.addEventListener('lazyunveilread', function(e){
        const container = e.target;
        const module = container.getAttribute('data-module');

        if(module) {
            if(rb.getComponent){
                rb.getComponent(container, module);
            } else {
                window.lazySizes.rAF(function(){
                    container.classList.add('js-rb-live');
                });
            }
        }
    });
})(window);

