(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './$_param'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./$_param'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.$_param);
        global.$_serialize = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });


    var rb = window.rb;
    var $ = rb.$ || window.jQuery;

    if (!$.fn.serializeArray || !$.fn.serialize) {
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

    exports.default = $.fn.serializeArray;
});
