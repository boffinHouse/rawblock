(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './add-log'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./add-log'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.addLog);
        global.promiseCatchLogger = mod.exports;
    }
})(this, function (exports, _addLog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _addLog2 = _interopRequireDefault(_addLog);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var promiseProto = Promise.prototype;
    var origCatch = promiseProto.catch;
    var origThen = promiseProto.then;
    var promiseLogger = (0, _addLog2.default)({}, 1);

    function isError(e) {
        return !!(e && (e instanceof Error || e.stack && e.message && typeof e.message == 'string'));
    }

    promiseProto.catch = function (catchFn) {

        var catchLogger = function catchLogger(error) {
            if (isError(error)) {
                promiseLogger.logError(error, 'catch logger');
            } else {
                promiseLogger.logWarn(error, 'catch logger');
            }

            return catchFn.apply(this, arguments);
        };

        return arguments.length == 1 && typeof catchFn == 'function' ? origCatch.call(this, catchLogger) : origCatch.apply(this, arguments);
    };

    promiseProto.then = function (successFn, errorFn) {

        var catchLogger = function catchLogger(error) {
            if (isError(error)) {
                promiseLogger.logInfo(error, 'catch logger');
            } else {
                promiseLogger.log(error, 'catch logger');
            }

            return errorFn.apply(this, arguments);
        };

        return arguments.length == 2 && typeof errorFn == 'function' ? origThen.call(this, successFn, catchLogger) : origThen.apply(this, arguments);
    };

    exports.default = promiseLogger;
});
