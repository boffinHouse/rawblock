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
        global.storage = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var rb = window.rb;

    rb.storage = {};

    ['session', 'local'].forEach(function (type) {
        var storage = void 0;
        var testStr = rb.getID && rb.getID() || 'test' + Date.now().toString(36);

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
                var value = void 0;

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

    exports.default = rb.storage;
});
