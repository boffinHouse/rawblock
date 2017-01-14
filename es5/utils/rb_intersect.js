(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './rb_viewport'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./rb_viewport'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.rb_viewport);
        global.rb_intersect = mod.exports;
    }
})(this, function (exports, _rb_viewport) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _rb_viewport2 = _interopRequireDefault(_rb_viewport);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var rb = window.rb;
    var $ = rb.$;
    var intersectProp = rb.Symbol('intersect');
    var wait = Promise.resolve();

    rb.intersects = function (element, margin, intersect) {
        var intersectValue = element[intersectProp];

        margin = parseInt(margin, 10) || 0;
        intersect = parseFloat(intersect) || 0;

        return intersectValue && intersectValue[margin] && intersectValue[margin][intersect] ? intersectValue[margin][intersect].value : (0, _rb_viewport2.default)(element, margin, intersect);
    };

    function checkIntersect(e) {
        var margin = void 0,
            intersectObj = void 0,
            intersect = void 0,
            inViewport = void 0;
        var element = e.target;
        var intersectValue = element[intersectProp];

        if (intersectValue) {
            for (margin in intersectValue) {
                if (intersectValue[margin]) {
                    for (intersect in intersectValue[margin]) {
                        if (intersectObj = intersectValue[margin][intersect]) {
                            inViewport = (0, _rb_viewport2.default)(element, intersectObj.margin, intersectObj.intersect);

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
                    value: (0, _rb_viewport2.default)(element, margin, intersect),
                    margin: margin,
                    intersect: intersect,
                    cbs: $.Callbacks()
                };
            }

            intersectValue[margin][intersect].cbs.add(fn);

            if (intersectValue[margin][intersect].value) {
                wait.then(function () {
                    if (intersectValue[margin][intersect].value) {
                        fn.call(element, { target: element, type: 'rb_intersect', inViewport: true, originalEvent: $.Event('initial') });
                    }
                });
            }
        },
        remove: function remove(element, fn, opts) {
            var margin = void 0,
                intersect = void 0;
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

    exports.default = rb.intersects;
});
