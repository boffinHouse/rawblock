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
    global.templateIf = mod.exports;
  }
})(this, function (exports, _globalRb) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = iff;

  var _globalRb2 = _interopRequireDefault(_globalRb);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  /**
   * Returns yes, if condition is true-thy no/empty string otherwise. Can be used inside of [`rb.template`]{@link rb.template}
   *
   * @memberOf rb
   *
   * @param condition
   * @param {String} yes
   * @param {String} [no=""]
   * @returns {string}
   */
  function iff(condition, yes, no) {
    return condition ? yes : no || '';
  }

  _globalRb2.default.if = iff;
});
