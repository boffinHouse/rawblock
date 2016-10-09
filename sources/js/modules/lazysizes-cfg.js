require('lazysizes');
require('lazysizes/plugins/respimg/ls.respimg');
require('lazysizes/plugins/optimumx/ls.optimumx');
//require('lazysizes/plugins/parent-fit/ls.parent-fit');

(function (window) {
    'use strict';
    var rbLiveClass;
    var rb = window.rb;
    var lazySizesConfig = window.lazySizesConfig || {};

    lazySizesConfig.hFac = 1;
    lazySizesConfig.constrainPixelDensity = true;

    if(!window.lazySizesConfig){
        window.lazySizesConfig = lazySizesConfig;
    }

    function configureMediaQueries(){
        var cssConfig = rb.cssConfig;
        document.removeEventListener('lazyunveilread', configureMediaQueries);
        Object.assign(lazySizesConfig.customMedia, cssConfig.mqs);
        rbLiveClass = ['js', 'rb', 'live'].join(cssConfig.nameSeparator || rb.nameSeparator || '-');
    }

    document.addEventListener('lazyunveilread', configureMediaQueries);

    document.addEventListener('lazyunveilread', function(e){
        var container = e.target;
        var module = container.getAttribute('data-module');

        if(module) {
            if(rb.getComponent){
                rb.getComponent(container, module);
            } else {
                window.lazySizes.rAF(function(){
                    container.classList.add(rbLiveClass);
                });
            }
        }
    });
})(window);

