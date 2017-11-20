(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './global-rb', '../rb_$/$_callbacks', './debounce'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./global-rb'), require('../rb_$/$_callbacks'), require('./debounce'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.globalRb, global.$_callbacks, global.debounce);
        global.wheelintent = mod.exports;
    }
})(this, function (exports, _globalRb, _$_callbacks) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _globalRb2 = _interopRequireDefault(_globalRb);

    var _$_callbacks2 = _interopRequireDefault(_$_callbacks);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var rbWheelProp = (_globalRb2.default.Symbol || Symbol)('rbWheel');
    var special = _globalRb2.default.events && _globalRb2.default.events.special || {};

    exports.default = special.rb_wheelintent = {
        handler: function handler(e) {
            var wheelData = this[rbWheelProp];

            if (wheelData && wheelData.cbs) {
                wheelData.cbs.fireWith(this, [e]);
            }
        },
        enterHandler: function enterHandler(e) {
            var wheelData = this[rbWheelProp];

            if (!wheelData) {
                this.removeEventListener('mouseenter', special.rb_wheelintent.enterHandler);
                return;
            }

            this.addEventListener('mousemove', special.rb_wheelintent.moveHandler);
            wheelData._page = [e.pageX, e.pageY];
            this.removeEventListener('wheel', special.rb_wheelintent.handler);
        },
        leaveHandler: function leaveHandler() {
            this.removeEventListener('mousemove', special.rb_wheelintent.moveHandler);
            this.removeEventListener('wheel', special.rb_wheelintent.handler);
        },
        moveHandler: function moveHandler(e) {
            var wheelData = this[rbWheelProp];

            if (!wheelData || !wheelData._page || wheelData.intent) {
                this.removeEventListener('mousemove', special.rb_wheelintent.moveHandler);
                return;
            }

            if (Math.max(Math.abs(wheelData._page[0] - e.pageX), Math.abs(wheelData._page[1] - e.pageY)) > 5) {
                this.removeEventListener('wheel', special.rb_wheelintent.handler);
                this.addEventListener('wheel', special.rb_wheelintent.handler);
                this.removeEventListener('mousemove', special.rb_wheelintent.moveHandler);
            }
        },
        add: function add(elem, fn, _opts) {
            var wheelData = elem[rbWheelProp];

            if (!wheelData) {
                wheelData = {
                    cbs: (0, _$_callbacks2.default)(),
                    intentCbs: (0, _$_callbacks2.default)(),
                    intent: false
                };

                elem[rbWheelProp] = wheelData;

                elem.addEventListener('mouseenter', special.rb_wheelintent.enterHandler);
                elem.addEventListener('mouseleave', special.rb_wheelintent.leaveHandler);
            }

            wheelData.cbs.add(fn);
        },
        remove: function remove(elem, fn, _opts) {
            var wheelData = elem[rbWheelProp];

            if (!wheelData) {
                return;
            }

            wheelData.cbs.remove(fn);

            if (!wheelData.cbs.has()) {
                delete elem[rbWheelProp];
                elem.removeEventListener('wheel', special.rb_wheelintent.handler);
                elem.removeEventListener('mouseenter', special.rb_wheelintent.enterHandler);
                elem.removeEventListener('mouseleave', special.rb_wheelintent.leaveHandler);
                elem.removeEventListener('mousemove', special.rb_wheelintent.moveHandler);
            }
        }
    };
});
