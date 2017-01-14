(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.rb_scrollintoview = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var regHash = /^#/;
    var $ = window.rb.$ || window.jQuery;
    /**
     * A jQuery/rb.$ plugin to scroll an element into the viewport
     * @function external:"jQuery.fn".scrollIntoView
     * @param options {object} All jQuery animate options and additional options
     * @param options.focus {Element} Element that should be focused after animation is done.
     * @param options.hash {String} Hash to set on the location object
     * @param options.scrollingElement {Element}
     * @param options.durationBase=350 {Number}
     * @param options.durationMax=700 {Number}
     * @param options.durationMultiplier=0.2 {Number}
     *
     * @returns {jQueryfiedDOMList}
     */
    $.fn.scrollIntoView = function (options) {
        var bbox = void 0,
            distance = void 0,
            scrollingElement = void 0,
            opts = void 0,
            focus = void 0,
            pos = void 0;
        var elem = this.get(0);

        if (elem) {
            options = options || {};
            bbox = elem.getBoundingClientRect();
            distance = Math.max(Math.abs(bbox.top), Math.abs(bbox.left));
            scrollingElement = options.scrollingElement || rb.getPageScrollingElement();
            pos = {
                scrollTop: bbox.top + (options.offsetTop || 0),
                scrollLeft: bbox.left + (options.offsetLeft || 0)
            };

            if (!options.scrollingElement || options.scrollingElement.contains(elem)) {
                pos.scrollTop += scrollingElement.scrollTop;
                pos.scrollLeft += scrollingElement.scrollLeft;
            }

            if (options.easing) {
                rb.addEasing(options.easing);
            }

            if (!options.duration) {
                options.duration = Math.min(options.durationMax || 700, (options.durationBase || 350) + distance * (options.durationMultiplier || 0.2));
            }

            opts = Object.assign({}, options, {

                always: function always() {
                    var top = void 0,
                        left = void 0,
                        hash = void 0;

                    if (options.forcePosition) {
                        top = scrollingElement.scrollTop;
                        left = scrollingElement.scrollLeft;
                    }

                    if (focus = options.focus) {
                        if (typeof focus == 'string') {
                            focus = regHash.test(focus) ? document.querySelector(focus) : document.getElementById(focus);
                        }

                        if (focus) {
                            rb.setFocus(focus);
                        }
                    }

                    if (options.hash) {
                        hash = typeof options.hash == 'string' ? options.hash : elem.id || elem.name;

                        if (hash) {
                            location.hash = hash;
                        }
                    }

                    if (options.forcePosition) {
                        scrollingElement.scrollTop = top;
                        scrollingElement.scrollLeft = left;
                    }

                    if (options.always) {
                        options.always.call(elem);
                    }
                }
            });

            $(scrollingElement).animate(pos, opts);
        }

        return this;
    };

    exports.default = $.fn.scrollIntoView;
});
