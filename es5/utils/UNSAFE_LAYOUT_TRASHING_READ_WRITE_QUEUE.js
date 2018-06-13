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
        global.UNSAFE_LAYOUT_TRASHING_READ_WRITE_QUEUE = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.read = read;
    exports.write = write;
    var resolvedPromise = Promise.resolve();

    var readRunning = false;
    var writeRunning = false;
    var readQueue = [];
    var writeQueue = [];

    var resolveRead = function resolveRead() {
        while (readQueue.length) {
            readQueue.shift()();
        }

        readRunning = false;
    };

    var resolveWrite = function resolveWrite() {
        resolvedPromise.then(function () {
            while (writeQueue.length) {
                writeQueue.shift()();
            }

            writeRunning = false;
        });
    };

    function read(fn) {
        readQueue.push(fn);

        if (!readRunning) {
            readRunning = true;
            resolvedPromise.then(resolveRead);
        }
    }

    function write(fn) {
        writeQueue.push(fn);

        if (!writeRunning) {
            writeRunning = true;
            read(resolveWrite);
        }
    }
});
