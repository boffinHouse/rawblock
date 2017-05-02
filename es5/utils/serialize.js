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
        global.serialize = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = serialize;
    var rCRLF = /\r?\n/g;
    var rcheckableType = /^(?:checkbox|radio)$/i;
    var rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i;
    var rsubmittable = /^(?:input|select|textarea|keygen)/i;

    /**
     *
     * @param elements {Element, Element[]}
     * @return {Array}
     */
    function serialize(elements) {
        var array = [];

        if (!Array.isArray(elements)) {
            elements = elements.nodeType ? [elements] : Array.from(elements);
        }

        elements.forEach(function (element) {
            var elements = element.elements && Array.from(element.elements) || [element];

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
    }
});
