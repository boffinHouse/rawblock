(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './panelgroup'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./panelgroup'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.panelgroup);
    global.tabs = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = rb.components.tabs;
});
