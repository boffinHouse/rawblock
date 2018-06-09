(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './glob'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./glob'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.glob);
    global.globalRb = mod.exports;
  }
})(this, function (exports, _glob) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _glob2 = _interopRequireDefault(_glob);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  if (!_glob2.default.rb) {
    _glob2.default.rb = {};
  }

  var rb = _glob2.default.rb;

  /**
   * rawblock main object holds classes and util properties and methods to work with rawblock
   * @namespace rb
   */

  exports.default = rb;
});
