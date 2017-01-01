(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './scrollintoview'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./scrollintoview'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.scrollintoview);
        global.smoothscroll = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });


    var rb = window.rb;
    var $ = rb.$;

    var smoothScroll = {
        init: function init() {
            this.init = $.noop;
            Object.assign(this.defaults, rb.cssConfig.smoothScroll);
        },
        defaults: {
            easing: 'ease-in-out',
            durationMax: 1000,
            durationBase: 300,
            durationMultiplier: 0.2,
            forcePosition: true
        },
        handler: function handler(anchor, event, dataAttr) {
            var data = rb.jsonParse(dataAttr);
            var href = data && data.id || anchor.getAttribute('href').split('#')[1];
            var elem = href ? document.getElementById(href) : null;

            if (elem) {
                this.scrollTo(elem, data);
                event.preventDefault();
            }
        },

        scrollTo: function scrollTo(elem, options) {
            this.init();

            $(elem).scrollIntoView(Object.assign({}, this.defaults, {
                focus: elem,
                hash: elem.id
            }, options));
        }
    };

    rb.click.add('smoothscroll', function (anchor, event, dataAttr) {
        smoothScroll.handler(anchor, event, dataAttr);
    });

    exports.default = smoothScroll;
});
