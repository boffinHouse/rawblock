(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './rb_viewport', './rb_layoutobserve'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./rb_viewport'), require('./rb_layoutobserve'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.rb_viewport, global.rb_layoutobserve);
        global.rb_intersect = mod.exports;
    }
})(this, function (module) {
    'use strict';

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    (function (factory) {
        if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
            module.exports = factory();
        } else {
            factory();
        }
    })(function () {
        'use strict';
        /* jshint eqnull: true */

        var rb = window.rb;
        var $ = rb.$;
        var intersectProp = rb.Symbol('intersect');
        var checkInViewport = rb.checkInViewport;

        rb.intersects = function (element, margin, intersect) {
            var intersectValue = element[intersectProp];

            margin = parseInt(margin, 10) || 0;
            intersect = parseFloat(intersect) || 0;

            return intersectValue && intersectValue[margin] && intersectValue[margin][intersect] ? intersectValue[margin][intersect].value : checkInViewport(element, margin, intersect);
        };

        function checkIntersect(e) {
            var margin, intersectObj, intersect, inViewport;
            var element = e.target;
            var intersectValue = element[intersectProp];

            if (intersectValue) {
                for (margin in intersectValue) {
                    if (intersectValue[margin]) {
                        for (intersect in intersectValue[margin]) {
                            if (intersectObj = intersectValue[margin][intersect]) {
                                inViewport = checkInViewport(element, intersectObj.margin, intersectObj.intersect);

                                if (intersectObj.value != inViewport) {
                                    intersectObj.value = inViewport;
                                    intersectObj.cbs.fireWith(element, [{ target: element, type: 'rb_intersect', inViewport: inViewport, originalEvent: e }]);
                                }
                            }
                        }
                    }
                }
            }
        }

        rb.events.special.rb_intersect = {
            add: function add(element, fn, opts) {
                var intersectValue = element[intersectProp];
                var margin = opts && opts.margin && parseInt(opts.margin, 10) || 0;
                var intersect = opts && opts.intersect && parseFloat(opts.intersect) || 0;

                if (!intersectValue) {
                    intersectValue = {};
                    element[intersectProp] = intersectValue;

                    rb.events.add(element, 'rb_layoutchange', checkIntersect);
                }

                if (!intersectValue[margin]) {
                    intersectValue[margin] = {};
                }

                if (!intersectValue[margin][intersect]) {
                    intersectValue[margin][intersect] = {
                        value: checkInViewport(element, margin, intersect),
                        margin: margin,
                        intersect: intersect,
                        cbs: $.Callbacks()
                    };
                }

                intersectValue[margin][intersect].cbs.add(fn);

                if (intersectValue[margin][intersect].value) {
                    setTimeout(function () {
                        if (intersectValue[margin][intersect].value) {
                            fn.call(element, { target: element, type: 'rb_intersect', inViewport: true, originalEvent: $.Event('initial') });
                        }
                    });
                }
            },
            remove: function remove(element, fn, opts) {
                var margin, intersect;
                var remove = true;
                var intersectValue = element[intersectProp];

                if (!intersectValue) {
                    return;
                }

                margin = opts && opts.margin && parseInt(opts.margin, 10) || 0;
                intersect = opts && opts.intersect && parseFloat(opts.intersect) || 0;

                if (!intersectValue[margin] || !intersectValue[margin][intersect]) {
                    return;
                }

                intersectValue[margin][intersect].cbs.remove(fn);

                if (!intersectValue[margin][intersect].cbs.has()) {
                    intersectValue[margin][intersect] = null;

                    for (margin in intersectValue) {
                        for (intersect in intersectValue[margin]) {
                            if (intersectValue[margin][intersect]) {
                                remove = false;
                                break;
                            }
                        }
                    }

                    if (remove) {
                        element[intersectProp] = null;
                        rb.events.remove(element, 'rb_layoutchange', checkIntersect);
                    }
                }
            }
        };
        return rb.intersects;
    });
});
