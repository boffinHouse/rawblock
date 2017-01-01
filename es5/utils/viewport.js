(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.viewport = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
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
        var tmpValue = void 0,
            boxArea = void 0,
            intersectArea = void 0;
        var value = false;
        var box = element.getBoundingClientRect();

        if (box.top || box.left || box.right || box.bottom || element.getClientRects().length) {
            var top = 0;
            var left = 0;
            var right = viewportWidth || window.innerWidth;
            var bottom = viewportHeight || window.innerHeight;

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
        }

        return value;
    };

    exports.default = rb.checkInViewport;
});
