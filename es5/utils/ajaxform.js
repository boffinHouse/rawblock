(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './serialize', '../rb_$/$_param', './fetch'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./serialize'), require('../rb_$/$_param'), require('./fetch'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.serialize, global.$_param, global.fetch);
        global.ajaxform = mod.exports;
    }
})(this, function (exports, _serialize, _$_param, _fetch) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getFormFetchOptions = getFormFetchOptions;
    exports.default = fetchForm;

    var _serialize2 = _interopRequireDefault(_serialize);

    var _$_param2 = _interopRequireDefault(_$_param);

    var _fetch2 = _interopRequireDefault(_fetch);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

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
            fetchOpts.url += '?' + (0, _$_param2.default)((0, _serialize2.default)(element));
        }

        return fetchOpts;
    }

    /**
     * Fetches a form using rb.fetch
     *
     * @param element {HTMLFormElement}
     * @return {Promise}
     */
    /**
     * @module ajaxform
     */

    function fetchForm(element) {
        return (0, _fetch2.default)(getFormFetchOptions(element));
    }
});
