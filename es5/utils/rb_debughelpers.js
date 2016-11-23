(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod);
        global.rb_debughelpers = mod.exports;
    }
})(this, function (module) {
    'use strict';

    if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
        (function () {
            var helpers = {};
            var devData = {
                componentsCount: 0
            };

            helpers.onEventsAdd = function (element, type, handler, opts) {
                if (opts && (type == 'mouseenter' || type == 'mouseleave' || type == 'focusin' || type == 'focusout')) {

                    if (!opts.capture && (opts.closest || opts.matches)) {
                        rb.logInfo('mouseenter/mouseleave/focusin/focusout delegated without capture option.', arguments);
                    }

                    if (opts.capture && opts.closest) {
                        rb.logInfo('mouseenter/mouseleave/focusin/focusout delegated with :closest instead of :matches.', arguments);
                    }
                }

                if (type == 'focusin' || type == 'focusout') {
                    rb.logInfo('focusin/focusout used. consider using focus/blur with :capture.', arguments);
                }

                if (opts.closest && (type == 'input' || type == 'change')) {
                    rb.logInfo(type + ' event has always a form field target. :matches(' + opts.closest + ') might be faster with the same result.', arguments);
                }
            };

            var searchElementsStartTime = void 0;
            helpers.onSearchElementsStart = function () {
                searchElementsStartTime = Date.now();
            };

            helpers.onSearchElementsEnd = function (len) {
                if (len > 99) {
                    rb.logWarn(len + ' component elements were initialized. Try to lower this number.');
                } else {
                    rb.logInfo(len + ' component elements were initialized.');
                }

                searchElementsStartTime = Date.now() - searchElementsStartTime;

                if (searchElementsStartTime > 99) {
                    rb.logWarn('Component initialization without rendering took ' + searchElementsStartTime + '. Try to lower this number.');
                } else {
                    rb.logInfo('Component initialization without rendering took ' + searchElementsStartTime + '.');
                }
            };

            if (window.EventTarget && EventTarget.prototype.addEventListener) {
                (function (target) {
                    var eventSymbol = window.Symbol && window.Symbol('_debugEvents') || '_debugEvents' + Date.now();
                    var addEventListener = target.addEventListener;
                    var removeEventListener = target.removeEventListener;
                    var hasMultiHandlerCount = function hasMultiHandlerCount(list, needle) {
                        var firstIndex = list ? list.indexOf(needle) : -1;

                        return firstIndex != -1 && list.lastIndexOf(needle) != firstIndex;
                    };

                    target.addEventListener = function (type, handler) {
                        var _this = this,
                            _arguments = arguments;

                        if (this) {
                            if (!this[eventSymbol]) {
                                this[eventSymbol] = {};
                            }
                            if (!this[eventSymbol][type]) {
                                this[eventSymbol][type] = [];
                            }

                            this[eventSymbol][type].push(handler);

                            if (hasMultiHandlerCount(this[eventSymbol][type], handler)) {
                                setTimeout(function () {
                                    if (hasMultiHandlerCount(_this[eventSymbol][type], handler)) {
                                        rb.logWarn('EventTarget has multiple same handlers for ' + type, _arguments, handler);
                                    }
                                }, 99);
                            }
                        }

                        return addEventListener.apply(this, arguments);
                    };

                    target.removeEventListener = function (type, handler) {
                        var _this2 = this,
                            _arguments2 = arguments;

                        if (this && this[eventSymbol] && this[eventSymbol][type]) {
                            var index = this[eventSymbol][type].indexOf(handler);

                            if (index != -1) {
                                this[eventSymbol][type].splice(index, 1);
                            }

                            if (hasMultiHandlerCount(this[eventSymbol][type], handler)) {
                                setTimeout(function () {
                                    if (hasMultiHandlerCount(_this2[eventSymbol][type], handler)) {
                                        rb.logWarn('EventTarget has multiple same handlers for ' + type, _arguments2, handler);
                                    }
                                }, 99);
                            }
                        }

                        return removeEventListener.apply(this, arguments);
                    };
                })(EventTarget.prototype);
            }

            Object.assign(window.rb, {
                debugHelpers: helpers,
                devData: devData
            });

            if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
                window.addEventListener('load', function () {
                    if (rb.devData.componentsCount > 99) {
                        rb.logWarn(devData.componentsCount + ' components were registered before rb.ready. Try to lower this number.');
                    } else {
                        rb.logInfo(devData.componentsCount + ' components were registered before rb.ready.');
                    }
                });
            }

            module.exports = helpers;
        })();
    }
});
