(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    var rb = window.rb;
    var $ = rb.$ || window.jQuery;

    ['rbfocusenter', 'rbfocusleave'].forEach(function (type) {
        var isLeave = type == 'rbfocusleave';
        var sym = rb.Symbol('_' + type);

        rb.events.special[type] = {
            setup: function (element) {
                var evt, reset;
                var isEntered = false;
                var data = element[sym];

                if (!data) {
                    reset = function () {
                        if (element != document.activeElement && !element.contains(document.activeElement)) {
                            isEntered = false;
                            if (isLeave) {
                                data.cbs.fireWith(evt.target, [{target: evt.target, type: 'rbfocusleave'}]);
                            }
                        }
                    };

                    data = {
                        enter: function (e) {
                            if (!isEntered) {
                                isEntered = true;
                                if (!isLeave) {
                                    data.cbs.fireWith(e.target, [{target: e.target, type: 'rbfocusenter'}]);
                                }
                            }
                        },
                        leave: function (e) {
                            if (isLeave || isEntered) {
                                evt = e;
                                setTimeout(reset);
                            }
                        },
                        cbs: $.Callbacks(),
                    };

                    if (!isLeave) {
                        element.addEventListener('focus', data.enter, true);
                    }
                    element.addEventListener('blur', data.leave, true);
                    element[sym] = data;
                }

                return data;

            },
            add: function (element, fn) {
                this.setup(element).cbs.add(fn);
            },
            remove: function (elem, fn) {
                var data = elem[sym];

                if (data && data.cbs) {
                    data.cbs.remove(fn);

                    if (!data.cbs.has()) {
                        elem.removeEventListener('focus', data.enter, true);
                        elem.removeEventListener('blur', data.leave, true);
                        elem[sym] = null;
                    }
                }
            }
        };
    });

    return rb.events;
}));
