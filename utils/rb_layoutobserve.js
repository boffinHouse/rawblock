(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    /* jshint eqnull: true */
    var observeClass, observedElements;
    var rb = window.rb;
    var $ = rb.$;
    var elementIndex = 0;
    var resumeElementIndex = 0;
    var isInstalled = false;
    var layoutObserveProp = rb.Symbol('layoutObserve');
    var rbRic = rb.rIC;

    var timedOutCheck = function(){
        rbRic(resumeCheckElements);
    };

    var rIC = function(){rb.rAFQueue(timedOutCheck, true);};

    var resumeCheckElements = function(){
        if(resumeElementIndex == elementIndex){
            checkElements();
        }
    };
    var checkElements = function (e){
        var element, start, observer, event;
        var length = observedElements.length;

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

                event = [{target: element, type: 'rb_layoutchange', originalEvent: e}];

                observer.cbs.fireWith(element, event);

                if(!start){
                    start = Date.now();
                } else if(Date.now() - start > 3){
                    elementIndex++;
                    resumeElementIndex = elementIndex;
                    rIC();
                    return;
                }
            }
        }

        elementIndex = 0;
    };

    var throtteledCheckElements = rb.throttle((function(e){
        elementIndex = 0;
        checkElements(e);
    }), {read: true, delay: 450});

    var addEvents = function(){
        if(isInstalled){return;}
        isInstalled = true;

        observeClass = ['js', 'rb', 'layoutobserve'].join(rb.nameSeparator);
        observedElements = document.getElementsByClassName(observeClass);

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
                };

                elem[layoutObserveProp] = observer;

                rb.rAFQueue(function(){
                    elem.classList.add(observeClass);
                }, true);

                addEvents();
            }

            observer.cbs.add(fn);
        },
        remove: function (elem, fn, opts) {
            var observer = elem[layoutObserveProp];

            if(!observer){return;}

            observer.cbs.remove(fn);

            if(!observer.cbs.has()){
                delete elem[layoutObserveProp];
                rb.rAFQueue(function(){
                    elem.classList.remove(observeClass);
                }, true);
            }
        },
    };

    rb.events.special.rb_layoutobserve = rb.events.special.rb_layoutchange;

    return rb.events.special.rb_layoutchange;
}));
