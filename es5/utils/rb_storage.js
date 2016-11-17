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
        global.rb_storage = mod.exports;
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

        if (!window.rb) {
            window.rb = {};
        }

        var rb = window.rb;

        rb.storage = {};

        ['session', 'local'].forEach(function (type) {
            var storage;
            var testStr = rb.getID();

            try {
                storage = window[type + 'Storage'];
            } catch (e) {
                storage = {};
            }

            rb.storage[type] = {
                set: function set(name, value) {
                    try {
                        storage.setItem(name, JSON.stringify(value));
                    } catch (e) {
                        return false;
                    }
                },
                get: function get(name) {
                    var value;
                    try {
                        value = JSON.parse(storage.getItem(name));
                    } catch (e) {
                        return false;
                    }

                    return value;
                },
                remove: function remove(name) {
                    try {
                        storage.removeItem(name);
                    } catch (e) {
                        return false;
                    }
                }
            };

            Object.defineProperty(rb.storage[type], 'supported', {
                value: rb.storage[type].set(testStr, testStr) !== false && rb.storage[type].get(testStr) == testStr,
                configurable: true
            });

            rb.storage[type].remove(testStr);
        });

        return rb.storage;
    });
});
