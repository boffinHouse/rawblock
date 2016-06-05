(function (factory) {
    if (typeof module === 'object' && module.exports) {
        require('./rb_viewport');
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
    var intersectProp = rb.Symbol('intersect');
    var checkInViewport = rb.checkInViewport;

    rb.intersects = function(element, margin){
        var intersectValue = element[intersectProp];

        margin = parseInt(margin, 10) || 0;

        return (intersectValue && intersectValue[margin]) ?
            intersectValue[margin].value :
            checkInViewport(element, margin)
        ;
    };

    function checkIntersect(e){
        var margin, inViewport;
        var element = e.target;
        var intersectValue = element[intersectProp];

        if(intersectValue){
            for(margin in intersectValue){
                if(intersectValue[margin]){
                    inViewport = checkInViewport(element, intersectValue[margin].margin);

                    if(intersectValue[margin].value != inViewport){
                        intersectValue[margin].value = inViewport;
                        intersectValue[margin].cbs.fireWith(element, [{target: element, type: 'rb_intersect', inViewport: inViewport, originalEvent: e}]);
                    }
                }
            }
        }
    }

    rb.events.special.rb_intersect = {
        add: function (element, fn, opts) {
            var intersectValue = element[intersectProp];
            var margin = opts && opts.margin && parseInt(opts.margin, 10) || 0;

            if(!intersectValue){
                intersectValue = {};
                element[intersectProp] = intersectValue;

                rb.events.add(element, 'rb_layoutchange', checkIntersect, {scroll: true});
            }

            if(!intersectValue[margin]){
                intersectValue[margin] = {
                    value: checkInViewport(element, margin),
                    margin: margin,
                    cbs: $.Callbacks(),
                };
            }

            intersectValue[margin].cbs.add(fn);
        },
        remove: function (element, fn, opts) {
            var margin;
            var remove = true;
            var intersectValue = element[intersectProp];

            if(!intersectValue){
                return;
            }

            margin = opts && opts.margin && parseInt(opts.margin, 10) || 0;

            if(!intersectValue[margin]){return;}

            intersectValue[margin].cbs.remove(fn);

            if(!intersectValue[margin].cbs.has()){
                intersectValue[margin] = null;

                for(margin in intersectValue){
                    if(intersectValue[margin]){
                        remove = false;
                        break;
                    }
                }

                if(remove){
                    rb.events.remove(element, 'rb_layoutchange', checkIntersect, {scroll: true});
                }
            }
        }
    };
    return rb.intersects;
}));
