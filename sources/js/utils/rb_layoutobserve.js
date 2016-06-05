(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    /* jshint eqnull: true */
    var rb = window.rb;
    var $ = rb.$;
    var elementIndex = 0;
    var isInstalled = false;
    var observeClass = 'js-rb-layout-observe';
    var layoutObserveProp = rb.Symbol('layoutObserve');
    var observedElements = document.getElementsByClassName(observeClass);

    var timedOutCheck = function(){
        setTimeout(checkElements);
    };

    var rIC = window.requestIdleCallback || function(){rb.rAFQueue(timedOutCheck, true);};

    var checkElements = function (e){
        var element, start, observer, scrollContainer;
        var length = observedElements.length;
        var isScroll = false;

        var event = [{target: null, type: 'rb_layoutchange', originalEvent: e}];

        if(e && e.type == 'scroll'){
            isScroll = true;
            scrollContainer = (e.target.nodeType == 1) ?
                e.target :
                null
            ;
        }

        for(; elementIndex < length; elementIndex++){
            element = observedElements[elementIndex];

            if(element){

                if(!(observer = element[layoutObserveProp])){
                    /* jshint loopfunc: true */
                    rb.rAFQueue(function(){
                        element.classList.remove(observeClass);
                    }, true);
                    continue;
                }

                if(isScroll && scrollContainer && scrollContainer.contains(element)){
                    continue;
                }

                event[0].target = element;

                observer.fullCbs.fireWith(element, event);

                if(!isScroll){
                    observer.cbs.fireWith(element, event);
                }

                if(!start){
                    start = Date.now();
                } else if(Date.now() - start > 4){
                    rIC(checkElements);
                    return;
                }
            }
        }

        elementIndex = 0;
    };

    var throtteledCheckElements = rb.throttle((function(e){
        elementIndex = 0;
        checkElements(e);
    }), {read: true, delay: 250});

    var addEvents = function(){
        if(isInstalled){return;}
        isInstalled = true;
        window.addEventListener('scroll', throtteledCheckElements, true);
        rb.resize.on(throtteledCheckElements);

        if(window.MutationObserver){
            new MutationObserver( throtteledCheckElements ).observe( rb.root, {childList: true, subtree: true, attributes: true} );
        } else {
            rb.root.addEventListener('DOMNodeInserted', throtteledCheckElements, true);
            rb.root.addEventListener('DOMAttrModified', throtteledCheckElements, true);
            setInterval(throtteledCheckElements, 999);
        }

        window.addEventListener('hashchange', throtteledCheckElements, true);

        ['focus', 'click', 'mouseover', 'load', 'transitionend', 'animationend', 'webkitAnimationEnd'].forEach(function(name){
            document.addEventListener(name, throtteledCheckElements, true);
        });
    };


    rb.events.special.rb_layoutchange = {
        add: function (elem, fn, opts) {
            var observer = elem[layoutObserveProp];

            if(!observer){
                observer = {
                    cbs: $.Callbacks(),
                    fullCbs: $.Callbacks(),
                };

                elem[layoutObserveProp] = observer;

                rb.rAFQueue(function(){
                    elem.classList.add(observeClass);
                }, true);

                addEvents();
            }

            observer[opts && opts.scroll ? 'fullCbs' : 'cbs'].add(fn);
        },
        remove: function (elem, fn, opts) {
            var observer = elem[layoutObserveProp];

            if(!observer){return;}

            observer[opts && opts.scroll ? 'fullCbs' : 'cbs'].remove(fn);

            if(!observer.cbs.has() && !observer.fullCbs.has()){
                delete elem[layoutObserveProp];
                rb.rAFQueue(function(){
                    elem.classList.remove(observeClass);
                }, true);
            }
        }
    };

    return rb.events.special.rb_layoutchange;
}));
