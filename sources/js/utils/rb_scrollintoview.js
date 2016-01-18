(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';

    var $ = rb.$ || window.jQuery;
    /**
     * A jQuery/rb.$ plugin to scroll an element into the viewort
     * @function external:"jQuery.fn".scrollIntoView
     * @param options {object} All jQuery animate options and additional options
     * @param options.focus {Element} Element that should be focused after animation is done.
     * @param options.hash {String} Hash to set on the location object
     *
     * @returns {jQueryfiedDOMList}
     */
    $.fn.scrollIntoView = function (options) {
        var bbox, distance, scrollingElement, opts;
        var elem = this.get(0);

        if (elem) {
            options = options || {};
            bbox = elem.getBoundingClientRect();
            distance = Math.max(Math.abs(bbox.top), Math.abs(bbox.left));
            scrollingElement = rb.getScrollingElement();

            if (options.easing) {
                rb.addEasing(options.easing);
            }

            if (!options.duration) {
                options.duration = Math.min(999, Math.max(200, distance * 0.4));
            }

            opts = Object.assign({}, options, {

                always: function () {
                    var top, left;

                    if (options.forcePosition) {
                        top = scrollingElement.scrollTop;
                        left = scrollingElement.scrollLeft;
                    }
                    if (options.focus) {
                        rb.setFocus(options.focus);
                    }

                    if (options.hash) {
                        location.hash = typeof options.hash == 'string' ?
                            options.hash :
                        elem.id || elem.name
                        ;
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

            $(scrollingElement).animate(
                {
                    scrollTop: scrollingElement.scrollTop + bbox.top + (options.offsetTop || 0),
                    scrollLeft: scrollingElement.scrollLeft + bbox.left + (options.offsetLeft || 0),
                },
                opts
            );
        }
        return this;
    };

    return $.fn.scrollIntoView;
}));
