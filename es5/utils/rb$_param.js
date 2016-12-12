(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.rb$_param = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var rb = window.rb;
    var $ = rb.$;
    var r20 = /%20/g;
    var rbracket = /\[]$/;

    function buildParams(prefix, obj, add) {
        var name = void 0;

        if (Array.isArray(obj)) {
            obj.forEach(function (v, i) {
                if (rbracket.test(prefix)) {
                    add(prefix, v);
                } else {
                    buildParams(prefix + '[' + ((typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object' && v != null ? i : '') + ']', v, add);
                }
            });
        } else if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) == 'object') {
            for (name in obj) {
                buildParams(prefix + '[' + name + ']', obj[name], add);
            }
        } else {
            add(prefix, obj);
        }
    }

    if (!$.param) {
        /**
         * This is a direct copy of jQuery's param method without traditional option.
         * @param a
         * @returns {string}
         */
        $.param = function (a) {
            var prefix = void 0;
            var s = [];
            var add = function add(key, value) {
                value = typeof value == 'function' ? value() : value == null ? '' : value;
                s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
            };

            if (Array.isArray(a)) {
                a.forEach(function (item) {
                    add(item.name, item.value);
                });
            } else {
                for (prefix in a) {
                    buildParams(prefix, a[prefix], add);
                }
            }

            // Return the resulting serialization
            return s.join('&').replace(r20, '+');
        };
    }

    if (!$.fn.serializeArray || $.fn.serialize) {
        (function () {
            var rCRLF = /\r?\n/g;
            var rcheckableType = /^(?:checkbox|radio)$/i;
            var rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i;
            var rsubmittable = /^(?:input|select|textarea|keygen)/i;

            $.fn.serializeArray = function () {
                var array = [];

                this.each(function () {
                    var elements = Array.from(this.elements) || [this];

                    elements.forEach(function (element) {
                        var type = void 0,
                            options = void 0,
                            i = void 0,
                            len = void 0;

                        if (element.name && !element.matches(':disabled') && rsubmittable.test(element.nodeName || '') && (type = element.type) && !rsubmitterTypes.test(type) && (element.checked || !rcheckableType.test(type))) {

                            if (options = element.selectedOptions) {
                                for (i = 0, len = options.length; i < len; i++) {
                                    array.push({ name: element.name, value: (options[i].value || '').replace(rCRLF, '\r\n') });
                                }
                            } else {
                                array.push({ name: element.name, value: (element.value || '').replace(rCRLF, '\r\n') });
                            }
                        }
                    });
                });

                return array;
            };

            $.fn.serialize = function () {
                return $.param(this.serializeArray());
            };
        })();
    }

    exports.default = $.param;
});
