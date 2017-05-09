(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.deferred = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = deferred;

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

        return promise;
    }

    if (window.rb) {
        window.rb.deferred = deferred;
    }
});
