(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';

    var started, added, scrollbarDiv, scrollbarWidth;
    var rb = window.rb;
    var $ = rb.$ || window.jQuery;

    var read = function(){
        if(scrollbarWidth == null){
            scrollbarWidth = scrollbarDiv.offsetWidth - scrollbarDiv.clientWidth;
            rb.rAFQueue(function(){
                scrollbarDiv.remove();
            });
        }
    };
    var add = function(){
        if(!added){
            added = true;
            (document.body || rb.root).appendChild(scrollbarDiv);
            (window.requestIdleCallback || setTimeout)(read);
        }
    };
    var getWidth = function(){
        if(scrollbarWidth == null){
            start();
            add();
            read();
        }
        return scrollbarWidth;
    };
    var start = function(){
        if(!started){
            started = true;
            scrollbarDiv = document.createElement('div');
            $(scrollbarDiv).css({
                width: '99px',
                height: '99px',
                overflow: 'scroll',
                position: 'absolute',
                visibility: 'hidden',
                top: '0px',
                left: '0px',
                zIndex: '-1',
            });

            rb.rAFQueue(add);
        }
    };

    if(window.requestIdleCallback){
        requestIdleCallback(start);
    } else {
        start();
    }


    Object.defineProperty(rb, 'scrollbarWidth', {
        get: getWidth,
        enumerable: true,
        configurable: true,
    });

    return getWidth;
}));
