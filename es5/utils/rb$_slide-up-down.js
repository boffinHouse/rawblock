(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports !== "undefined") {
        factory();
    } else {
        var mod = {
            exports: {}
        };
        factory();
        global.rb$_slideUpDown = mod.exports;
    }
})(this, function () {
    'use strict';

    var $ = window.rb.$;

    /**
     * A jQuery/rb.$ plugin to slideUp content. Difference to $.fn.slideUp: The plugin handles content hiding via height 0; visibility: hidden;
     * Also does not animate padding, margin, borders (use child elements)
     * @function external:"jQuery.fn".rbSlideUp
     * @param [options] {object} All jQuery animate options
     * @returns {jQueryfiedDOMList}
     */
    $.fn.rbSlideUp = function (options) {
        if (!options) {
            options = {};
        }

        if (this.length) {
            var opts = Object.assign({}, options, {
                always: function always() {
                    this.style.display = options.display ? 'none' : '';
                    this.style.visibility = 'hidden';

                    if (options.always) {
                        return options.always.apply(this, arguments);
                    }
                }
            });

            if (opts.easing) {
                rb.addEasing(opts.easing);
            }
            this.stop().animate({ height: 0 }, opts).css({ overflow: 'hidden', display: 'block', visibility: 'inherit' });
        }
        return this;
    };

    /**
     * A jQuery/rb.$ plugin to slideDown content. Difference to $.fn.slideDown: The plugin handles content showing also using visibility: 'inherit'
     * Also does not animate padding, margin, borders (use child elements)
     * @function external:"jQuery.fn".rbSlideDown
     * @param options {object} All jQuery animate options and options below
     * @param options.beforeCalculation {Function}
     * @param options.autoDuration {Boolean} deprecated use duration='auto' instead
     * @param options.durationMax=900 {Number}
     * @param options.durationBase=350 {Number}
     * @param options.durationMultiplier=0.3 {Number}
     * @param options.getHeight {Boolean}
     * @returns {jQueryfiedDOMList|Number}
     */
    $.fn.rbSlideDown = function (options) {
        var opts;
        var ret = this;

        if (!options) {
            options = {};
        }

        if (this.length) {
            opts = Object.assign({}, options, {
                always: function always() {
                    this.style.overflow = '';
                    this.style.height = 'auto';

                    if (options.always) {
                        return options.always.apply(this, arguments);
                    }
                }
            });

            if (opts.easing && !rb.$.easing[opts.easing]) {
                rb.addEasing(opts.easing);
            }
        }

        this.each(function () {
            var endValue;
            var $panel = $(this);
            var startHeight = $panel.innerHeight() + 'px';

            $panel.css({ overflow: 'hidden', display: 'block', height: 'auto', visibility: 'inherit' });

            if (options.beforeCalculation) {
                options.beforeCalculation($panel);
            }

            endValue = $panel.innerHeight();

            if (options.getHeight) {
                ret = endValue;
            }

            if (options.autoDuration || options.duration == 'auto') {
                opts.duration = Math.min((opts.durationBase || 350) + (endValue - startHeight) * (opts.durationMultiplier || 0.3), opts.durationMax || 900);
            }

            $panel.css({ height: startHeight }).animate({ height: endValue }, opts);
        });

        return ret;
    };
});
