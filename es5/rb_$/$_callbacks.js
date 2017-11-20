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
        global.$_callbacks = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Callbacks;
    function Callbacks(flags) {
        if (flags) {
            rb.log('not supported: ' + flags);
        }
        var list = [];

        return {
            add: function add(fn) {
                list.push(fn);
            },
            remove: function remove(fn) {
                var index = list.indexOf(fn);

                if (index != -1) {
                    list.splice(index, 1);
                }
            },
            fire: function fire() {
                this.fireWith(this, Array.from(arguments));
            },
            fireWith: function fireWith(that, args) {
                var i = void 0,
                    len = void 0;

                for (i = 0, len = list.length; i < len; i++) {
                    if (list[i]) {
                        list[i].apply(that, [].concat(args));
                    }
                }
            },
            has: function has() {
                return !!list.length;
            }
        };
    }

    if (typeof window != 'undefined' && window.rb && window.rb.$) {
        rb.$.Callbacks = Callbacks;
    }
});
