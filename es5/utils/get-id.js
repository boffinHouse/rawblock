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
        global.getId = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = getID;
    var id = Math.round(Date.now() * Math.random());

    /**
     * Returns a unique id based on Math.random and Date.now().
     * @memberof rb
     * @returns {string}
     */
    function getID() {
        id += Math.round(Math.random() * 1000);
        return id.toString(36);
    }

    if (window.rb) {
        window.rb.getID = getID;
    }
});
