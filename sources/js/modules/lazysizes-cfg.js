require('lazysizes');
require('lazysizes/plugins/optimumx/ls.optimumx');

(function (window) {
    'use strict';
    var docElem = document.documentElement;
    var addLifeClass = function (elem) {
        elem.classList.add('js-rb-life');
    };
    //only usefull if you use the picture element with the customMedia option.
    var addCustomMedia = function () {
        if (window.rb && window.rb.cssConfig && rb.cssConfig.mqs) {
            lazySizesConfig.customMedia = Object.assign(lazySizesConfig.customMedia || {}, rb.cssConfig.mqs, lazySizesConfig.customMedia);
        }
        removeEventListener('lazybeforeunveil', addCustomMedia, true);
    };

    window.lazySizesConfig = window.lazySizesConfig || {};

    //set expand to a higher value on larger displays
    setTimeout(function(){
        window.lazySizesConfig.expand = Math.max(Math.min(docElem.clientWidth, docElem.clientHeight, 1222), 359);
        window.lazySizesConfig.expFactor = Math.min(Math.max(1800 / lazySizesConfig.expand, 2), 4);
    });

    addEventListener('lazybeforeunveil', addCustomMedia, true);

    addEventListener('lazybeforeunveil', function (e) {

        if (!e.target.getAttribute('data-optimumx') && e.target.getAttribute('data-sizes') == 'auto') {
            e.target.setAttribute('data-optimumx', 'auto');
        } else if (e.target.getAttribute('data-module') && e.target.matches('.lazymodule, .lazypreload')) {
            e.target.classList.add('js-rb-life');
            if (window.rb && rb.life) {
                rb.life.searchModules();
            }
        } else if (e.target.classList.contains('lazymodules')) {
            Array.from(e.target.querySelectorAll('.lazymodule')).forEach(addLifeClass);
            if (window.rb && rb.life) {
                rb.life.searchModules();
            }
        }
    }, true);
})(window);

