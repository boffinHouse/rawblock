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
        global.addLog = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = addLog;
    var console = window.console || {};
    var log = console.log && console.log.bind ? console.log : rb.$.noop; //eslint-disable-line no-unused-vars
    var logs = ['error', 'warn', 'info', 'log'].map(function (errorName, errorLevel) {
        var fnName = errorName == 'log' ? 'log' : 'log' + errorName.charAt(0).toUpperCase() + errorName.substr(1);
        return {
            name: fnName,
            errorLevel: errorLevel,
            fn: (console[errorName] && console[errorName].bind ? console[errorName] : rb.$.noop).bind(console)
        };
    });

    /**
     * Adds a log method and a isDebug property to an object, which can be muted by setting isDebug to false.
     * @memberof rb
     * @param obj    {Object}
     * @param [initial] {Boolean}
     */
    function addLog(obj, initial) {
        var fakeLog = function fakeLog() {};

        var setValue = function setValue() {
            var level = obj.__isDebug;

            logs.forEach(function (log) {
                var fn = level !== false && (level === true || level >= log.errorLevel) ? log.fn : fakeLog;

                obj[log.name] = fn;
            });
        };

        obj.__isDebug = initial;
        setValue();

        Object.defineProperty(obj, 'isDebug', {
            configurable: true,
            enumerable: true,
            get: function get() {
                return obj.__isDebug;
            },
            set: function set(value) {
                if (obj.__isDebug !== value) {
                    obj.__isDebug = value;
                    setValue();
                }
            }
        });
    }

    if (window.rb) {
        window.rb.addLog = addLog;
    }
});
