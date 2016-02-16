(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';

    var added, scrollbarWidth;
    var rb = window.rb;
    var $ = rb.$ || window.jQuery;
    var scrollbarDiv = document.createElement('div');

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
            add();
            read();
        }
        return scrollbarWidth;
    };


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


    Object.defineProperty(rb, 'scrollbarWidth', {
        get: getWidth,
        enumerable: true,
        configurable: true,
    });

    return getWidth;
}));
