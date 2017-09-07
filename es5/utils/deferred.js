(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './global-rb'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./global-rb'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.globalRb);
        global.deferred = mod.exports;
    }
})(this, function (exports, _globalRb) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = deferred;

    var _globalRb2 = _interopRequireDefault(_globalRb);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    /**
     * Creates a promise with a resolve and a reject method.
     * @returns {Deferred}
     */
    function deferred() {
        var tmp = {
            isResolved: false,
            isRejected: false,
            isDone: false
        };

        var promise = new Promise(function (resolve, reject) {
            tmp.resolve = function (data) {
                promise.isResolved = true;
                promise.isDone = true;
                promise.value = data;
                return resolve(data);
            };

            tmp.reject = function (data) {
                promise.isRejected = true;
                promise.isDone = true;
                promise.value = data;
                promise.catch(function (value) {
                    return value;
                });
                return reject(data);
            };
        });

        Object.assign(promise, tmp);

        if (_globalRb2.default.logError && (_globalRb2.default.isDebug === true || _globalRb2.default.isDebug > 2)) {
            promise.catch(function (e) {
                _globalRb2.default.logError(e);throw e;
            });
        }

        return promise;
    }

    _globalRb2.default.deferred = deferred;
});
