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
        global.rb_prefixed = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    if (!window.rb) {
        window.rb = {};
    }
    var style = document.createElement('b').style;
    var rb = window.rb;
    var $ = rb.$;
    var prefixes = ['Webkit', 'webkit', 'Moz', 'moz', 'Ms', 'ms', 'O', 'o'];

    /**
     * Gets a string and returns a prefixed version. If empty string is returned there is no support.
     *
     * @memberof rb
     *
     * @param {String} name
     * @param {Object} [object=document.createElement('b').style]
     * @return {string}
     */
    rb.prefixed = function (name, object) {
        object = object || style;

        var i = void 0,
            partName = void 0,
            testName = void 0;
        var ret = '';

        name = $.camelCase(name);

        if (name in object) {
            ret = name;
        }

        if (!ret) {
            partName = $.camelCase('-' + name);
            for (i = 0; i < prefixes.length && !ret; i++) {
                testName = prefixes[i] + partName;
                if (testName in object) {
                    ret = testName;
                    break;
                }
            }
        }

        return ret;
    };

    exports.default = rb.prefixed;
});
