(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports !== "undefined") {
        factory();
    } else {
        var mod = {
            exports: {}
        };
        factory();
        global.rb_focusenterleave = mod.exports;
    }
})(this, function () {
    'use strict';

    /*
     use relatedTarget in the future (needs POC):
     https://bugzilla.mozilla.org/show_bug.cgi?id=962251
     */

    var rb = window.rb;
    var $ = rb.$ || window.jQuery;
    var sym = rb.Symbol('focusEnterLeave');

    ['rb_focusenter', 'rb_focusleave'].forEach(function (type) {

        rb.events.special[type] = {
            setup: function setup(element) {
                var evt = void 0,
                    reset = void 0,
                    isFocused = void 0,
                    isEntered = void 0;
                var data = element[sym];

                if (!data) {
                    isFocused = function isFocused() {
                        return document.activeElement && (element == document.activeElement || element.contains(document.activeElement));
                    };

                    reset = function reset() {
                        if (!isFocused()) {
                            isEntered = false;
                            data.rb_focusleaveCbs.fireWith(evt.target, [{ target: evt.target, type: 'rb_focusleave' }]);
                        }
                    };

                    data = {
                        enter: function enter(e) {
                            if (!isEntered) {
                                isEntered = true;
                                data.rb_focusenterCbs.fireWith(e.target, [{ target: e.target, type: 'rb_focusenter' }]);
                            }
                        },
                        leave: function leave(e) {
                            if (isEntered) {
                                evt = e;
                                setTimeout(reset);
                            }
                        },
                        rb_focusenterCbs: $.Callbacks(),
                        rb_focusleaveCbs: $.Callbacks()
                    };

                    isEntered = isFocused();

                    element.addEventListener('focus', data.enter, true);
                    element.addEventListener('blur', data.leave, true);
                    element[sym] = data;
                }

                return data;
            },
            add: function add(element, fn) {
                this.setup(element)[type + 'Cbs'].add(fn);
            },
            remove: function remove(elem, fn) {
                var data = elem[sym];

                if (data && data.cbs) {
                    data[type + 'Cbs'].remove(fn);

                    if (!data.rb_focusenterCbs.has() && !data.rb_focusleaveCbs.has()) {
                        elem.removeEventListener('focus', data.enter, true);
                        elem.removeEventListener('blur', data.leave, true);
                        elem[sym] = null;
                    }
                }
            }
        };
    });
});
