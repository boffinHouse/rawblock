(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './rb_$/$_slim', './rb_$/$_fx'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./rb_$/$_slim'), require('./rb_$/$_fx'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.$_slim, global.$_fx);
    global._$ = mod.exports;
  }
})(this, function (exports, _$_slim) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _$_slim2 = _interopRequireDefault(_$_slim);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  exports.default = _$_slim2.default;
});
