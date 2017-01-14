(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './fetch', '../rb_$/$_serialize'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./fetch'), require('../rb_$/$_serialize'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.fetch, global.$_serialize);
        global.ajaxform = mod.exports;
    }
})(this, function (exports, _fetch) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getFormFetchOptions = getFormFetchOptions;
    exports.default = fetchForm;

    var _fetch2 = _interopRequireDefault(_fetch);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    /**
     * @module ajaxform
     */

    var $ = window.rb.$ || window.jQuery;

    /**
     * Returns option to fetch a form using rb.fetch.
     * @param element {HTMLFormElement}
     * @return {{url: (string), type: string, data: *}}
     */
    function getFormFetchOptions(element) {
        var fetchOpts = {
            url: element.action,
            type: element.method.toUpperCase()
        };

        if (fetchOpts.type == 'POST') {
            Object.assign(fetchOpts, {
                data: new FormData(element),
                contentType: false,
                processData: false
            });
        } else {
            fetchOpts.url += '?' + $(element).serialize();
        }

        return fetchOpts;
    }

    /**
     * Fetches a form using rb.fetch
     *
     * @param element {HTMLFormElement}
     * @return {Promise}
     */
    function fetchForm(element) {
        return (0, _fetch2.default)(getFormFetchOptions(element));
    }
});
