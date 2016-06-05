(function (factory) {
    if (typeof module === 'object' && module.exports) {
        require('./rb_layoutobserve');
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    /* jshint eqnull: true */
    var rb = window.rb;
    var $ = rb.$;
    var resizeProp = rb.Symbol('resize');

    function checkDimension(e){
        var width, height, event, widthChanged, heightChanged;
        var element = e.target;
        var resizeObj = element[resizeProp];

        if(resizeObj){
            width = element.clientWidth;
            height = element.clientHeight;
            widthChanged = width != resizeObj.width;
            heightChanged = height != resizeObj.height;

            if(widthChanged || heightChanged){
                resizeObj.width = width;
                resizeObj.height = height;

                event = [{target: e.target, originalEvent: e, width: width, height: height, type: 'rb_resize'}];

                if(heightChanged){
                    resizeObj.heightCbs.fireWith(element,  event);
                }
                if(widthChanged){
                    resizeObj.widthCbs.fireWith(element,  event);
                }
                resizeObj.cbs.fireWith(element,  event);
            }
        }
    }

    rb.events.special.rb_resize = {
        add: function (element, fn, opts) {
            var resizeObj = element[resizeProp];

            if(!resizeObj){
                resizeObj = {
                    width: element.clientWidth,
                    height: element.clientHeight,
                    cbs: $.Callbacks(),
                    widthCbs: $.Callbacks(),
                    heightCbs: $.Callbacks(),
                };
                element[resizeProp] = resizeObj;

                rb.events.add(element, 'rb_layoutchange', checkDimension, opts);
            }


            if(!opts || (!opts.height && !opts.width)){
                resizeObj.cbs.add(fn);
            } else {
                if(opts.height){
                    resizeObj.heightCbs.add(fn);
                }
                if(opts.width){
                    resizeObj.widthCbs.add(fn);
                }
            }
        },
        remove: function (element, fn, opts) {
            var resizeObj = element[resizeProp];

            if(!resizeObj){
                return;
            }

            if(!opts || (!opts.height && !opts.width)){
                resizeObj.cbs.remove(fn);
            } else {
                if(opts.height){
                    resizeObj.heightCbs.remove(fn);
                }
                if(opts.width){
                    resizeObj.widthCbs.remove(fn);
                }
            }

            if(!resizeObj.heightCbs.has() && !resizeObj.widthCbs.has() && !resizeObj.cbs.has()){
                element[resizeProp] = null;
                rb.events.remove(element, 'rb_layoutchange', checkDimension, opts);
            }
        }
    };
    return rb.intersects;
}));
