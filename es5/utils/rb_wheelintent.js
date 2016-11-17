(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'babel-runtime/helpers/typeof', './rb_debounce'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('babel-runtime/helpers/typeof'), require('./rb_debounce'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global._typeof, global.rb_debounce);
        global.rb_wheelintent = mod.exports;
    }
})(this, function (module, _typeof2) {
    'use strict';

    var _typeof3 = _interopRequireDefault(_typeof2);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    (function (factory) {
        if ((typeof module === 'undefined' ? 'undefined' : (0, _typeof3.default)(module)) === 'object' && module.exports) {
            module.exports = factory();
        } else {
            factory();
        }
    })(function () {
        'use strict';
        /* jshint eqnull: true */

        var rb = window.rb;
        var $ = rb.$;
        var rbWheelProp = rb.Symbol('rbWheel');
        var special = rb.events.special;

        special.rb_wheelintent = {
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
                        cbs: $.Callbacks(),
                        intentCbs: $.Callbacks(),
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

        return rb.events.special.rb_wheelintent;
    });
});
