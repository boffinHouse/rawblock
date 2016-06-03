(function (factory) {
    if (typeof module === 'object' && module.exports) {
        require('./rb_viewport');
        require('./rb_lazyeach');
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    /* jshint eqnull: true */
    var rb = window.rb;
    var $ = rb.$;
    var intersectClass = 'js-rb-intersect';
    var intersectProp = rb.Symbol('intersect');
    var checkInViewport = rb.checkInViewport;
    var lazyEach = rb.lazyEach;
    var elements = document.getElementsByClassName(intersectClass);
    var right, bottom, callItems;

    function checkElement(element){
        var intersect, margin, intersectItem, inViewport, callItems;
        intersect = element[intersectProp];

        if(intersect) {
            for (margin in intersect) {
                intersectItem = intersect[margin];
                if (intersectItem) {

                    inViewport = checkInViewport(element, margin, right, bottom);

                    if (intersectItem.inView != inViewport) {
                        intersectItem.inView = inViewport;
                        if (!callItems) {
                            callItems = [];
                        }
                        callItems.push([intersectItem, {
                            target: elem,
                            type: 'rb_intersect',
                            inView: inViewport,
                            initial: false
                        }]);
                    }
                }
            }
        }
    }

    function checkElements(){
        var callItem;
        var length, index;

        right = window.innerWidth;
        bottom = window.innerHeight;

        lazyEach(elements, checkElement);

        if(callItems){
            for(index = 0, length = callItems.length; index < length; index++){
                callItem = callItems[index];
                callItem[0].callbacks.fireWith(callItem[1].target, [callItem[1]]);
            }
            callItems = null;
        }
    }

    rb.events.special.rb_intersect = {
        add: function (elem, fn, opts) {
            var intersect = elem[intersectProp];
            var getInitial = opts.initial;
            var margin = opts.margin || 0;

            if(!intersect){
                intersect = {};
                elem[intersectProp] = intersect;

                rb.rAFQueue(function(){
                    elem.classList.add(intersectClass);
                }, true);
            }

            if(!intersect[margin]){
                intersect[margin] = {
                    callbacks: $.Callbacks(),
                    inView: checkInViewport(elem, margin),
                };
            }

            intersect[margin].callbacks.add(fn);

            if(getInitial && intersect[margin].inView){
                rb.rIC(function(){
                    fn.call(elem, {target: elem, type: 'rb_intersect', inView: true, initial: true});
                });
            }
        },
        remove: function (elem, fn, opts) {
            var prop, intersectItem;
            var del = true;
            var intersect = elem[intersectProp];
            var margin = opts.margin || 0;

            if(!intersect || !intersect[margin]){
                return;
            }

            intersect[margin].callbacks.remove(fn);

            if(!intersect[margin].callbacks.has()){
                for(prop in intersect){
                    intersectItem = intersect[prop];
                    if(intersectItem && intersectItem.callbacks.has()){
                        del = false;
                        break;
                    }
                }

                delete elem[intersectProp];

                rb.rAFQueue(function(){
                    elem.classList.remove(intersectClass);
                }, true);
            }
        }
    };
    return rb.events.special.rb_intersect;
}));
