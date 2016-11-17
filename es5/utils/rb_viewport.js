(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod);
        global.rb_viewport = mod.exports;
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
