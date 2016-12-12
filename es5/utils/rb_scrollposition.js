(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './rb_layoutobserve'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./rb_layoutobserve'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.rb_layoutobserve);
        global.rb_scrollposition = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });


    var rb = window.rb;
    var $ = rb.$;
    var scrollPositionProp = rb.Symbol('scrollPosition');

    function getScrollPosition(element, forceRead) {
        var scrollingElement = void 0,
            box = void 0;
        var positionObj = element[scrollPositionProp];

        if (!positionObj || forceRead) {

            scrollingElement = rb.getPageScrollingElement();
            box = element.getBoundingClientRect();

            positionObj = {
                value: {
                    scrollTop: scrollingElement.scrollTop,
                    scrollLeft: scrollingElement.scrollLeft,
                    top: box.top,
                    left: box.left,
                    bottom: box.bottom,
                    right: box.right
                }
            };
        }

        return positionObj.value;
    }

    function checkScrollPosition(e) {
        var positions = void 0,
            positionObjValue = void 0;
        var element = e.target;
        var positionObj = element[scrollPositionProp];

        if (positionObj) {
            positionObjValue = positionObj.value;
            positions = getScrollPosition(element, true);

            if (positions.top != positionObjValue.top || positions.left != positionObjValue.left || positions.bottom != positionObjValue.bottom || positions.right != positionObjValue.right || positions.scrollTop != positionObjValue.scrollTop || positions.scrollLeft != positionObjValue.scrollLeft) {
                positionObj.value = positions;
                positionObj.cbs.fireWith(element, [{ target: element, value: positions, prevValue: positionObjValue }]);
            }
        }
    }

    rb.events.special.rb_scrollposition = {
        add: function add(element, fn, _opts) {
            var positionObj = element[scrollPositionProp];

            if (!positionObj) {
                positionObj = {
                    cbs: $.Callbacks(),
                    value: getScrollPosition(element)
                };

                element[scrollPositionProp] = positionObj;
                rb.events.add(element, 'rb_layoutchange', checkScrollPosition);
            }

            positionObj.cbs.add(fn);
        },
        remove: function remove(element, fn, _opts) {
            var positionObj = element[scrollPositionProp];

            if (!positionObj) {
                return;
            }

            positionObj.cbs.remove(fn);

            if (!positionObj.cbs.has()) {
                element[scrollPositionProp] = null;
                rb.events.remove(element, 'rb_layoutchange', checkScrollPosition);
            }
        }
    };

    exports.default = getScrollPosition;
});
