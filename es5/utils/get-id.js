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
    global.getId = mod.exports;
  }
})(this, function (exports, _globalRb) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = getID;

  var _globalRb2 = _interopRequireDefault(_globalRb);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

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

  _globalRb2.default.getID = getID;
});
