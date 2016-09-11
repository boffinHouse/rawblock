(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';

    var added, scrollbarWidth, lastClass;
    var rb = window.rb;
    var $ = rb.$;
    var scrollbarDiv = document.createElement('div');
    var setStyle = rb.rAF(function(){
        var size = scrollbarWidth || 0;
        var className = rb.statePrefix + 'scrollbarwidth' + rb.nameSeparator + Math.round(size);

        rb.root.style.setProperty('--rb-scrollbar-width', size + 'px', '');

        rb.root.classList.add(className);

        if(lastClass){
            rb.root.classList.remove(lastClass);
        }

        lastClass = className;

        if(!rb.ready.isDone){
            rb.ready.then(setStyle);
        }
    }, {throttle: true});

    var read = function(){
        if(scrollbarWidth == null){
            scrollbarWidth = scrollbarDiv.offsetWidth - scrollbarDiv.clientWidth;
            setStyle();

            rb.rAFQueue(function(){
                scrollbarDiv.remove();
            });
        }
    };

    var add = function(){
        if(!added){
            added = true;
            scrollbarDiv.className = 'js' + rb.nameSeparator + 'rb' + rb.nameSeparator + 'scrollbarobserve';
            (document.body || rb.root).appendChild(scrollbarDiv);
            rb.rIC(read);
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
        paddingLeft: '0px',
        paddingRight: '0px',
        borderLeftWidth: '0px',
        borderRightWidth: '0px',
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
