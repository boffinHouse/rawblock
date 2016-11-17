(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'babel-runtime/helpers/typeof'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('babel-runtime/helpers/typeof'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global._typeof);
        global.rb_viewport = mod.exports;
    }
})(this, function (module, _typeof2) {
    'use strict';

    var _typeof3 = _interopRequireDefault(_typeof2);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    (function (factory) {
        if ((typeof module === 'undefined' ? 'undefined' : (0, _typeof3.default)(module)) === 'object' && module.exports) {
            module.exports = factory();
        } else {
            factory();
        }
    })(function () {
        'use strict';
        /* jshint eqnull: true */

        var rb = window.rb;

        /**
            *
            * @param element
            * @param [margin=0] {Number}
            * @param [intersect=0] {Number}
            * @param [viewportWidth] {Number}
            * @param [viewportHeight] {Number}
            */
        rb.checkInViewport = function (element, margin, intersect, viewportWidth, viewportHeight) {
            var tmpValue, boxArea, intersectArea;
            var value = false;
            var top = 0;
            var left = 0;
            var right = viewportWidth || window.innerWidth;
            var bottom = viewportHeight || window.innerHeight;
            var box = element.getBoundingClientRect();

            if (margin) {
                top -= margin;
                left -= margin;
                right += margin;
                bottom += margin;
            }

            tmpValue = box.top <= bottom && box.bottom >= top && box.left <= right && box.right >= left;

            if (tmpValue) {
                value = tmpValue;

                if (intersect == 1) {
                    value = box.top >= top && box.bottom <= bottom && box.left >= left && box.right <= right;
                } else if (intersect) {
                    boxArea = Math.min(box.width, right) * Math.min(box.height, bottom);
                    intersectArea = (Math.min(box.bottom, bottom) - Math.max(box.top, top)) * (Math.min(box.right, right) - Math.max(box.left, left));

                    value = intersectArea / boxArea >= intersect;
                }
            }

            return value;
        };

        return rb.checkInViewport;
    });
});
