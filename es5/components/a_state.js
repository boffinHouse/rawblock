(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'mobx'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('mobx'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.mobx);
        global.a_state = mod.exports;
    }
})(this, function (exports, _mobx) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _mobx2 = _interopRequireDefault(_mobx);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var data = _mobx2.default.observable({ foo: 'initial' });

    setTimeout(function () {
        data.foo = 'changed';
    }, 100);

    setTimeout(function () {
        data.foo1 = 'secondChanged';
    }, 300);

    // // this will print Matt NN 10 times
    // _.times(10, function () {
    //     person.age = _.random(40);
    // });
    //
    // // this will print nothing
    // _.times(10, function () {
    //     person.lastName = _.random(40);
    // });

    exports.default = data;
});
