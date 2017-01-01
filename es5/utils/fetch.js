(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './deferred'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./deferred'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.deferred);
        global.fetch = mod.exports;
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
    var regQuery = /\?/;
    var getData = function getData(oReq, obj) {
        obj.xhr = oReq;
        obj.data = oReq.response || oReq.responseXML || oReq.responseText;
        obj.text = oReq.responseText;
        obj.xml = oReq.responseXML;
        obj.status = oReq.status;

        if (_typeof(obj.data) != 'object' && (oReq.getResponseHeader('Content-Type') || '').split(';')[0].endsWith('json')) {
            obj.data = rb.jsonParse(oReq.responseText) || obj.data;
        }
    };

    /**
     * Simple XHRequest util that returns a promise.
     * @memberof rb
     * @param {String|Object} url Either the URL to send for the request or the options Object.
     * @param {Object} [options]
     *  @param {String} [options.url] The URL for the request.
     *  @param {String|undefined} [options.username=undefined] The URL for the request.
     *  @param {String|undefined} [options.password=undefined] The URL for the request.
     *  @param {String} [options.type='GET'] The request type to use.
     *  @param {object} [options.data=null] The send data.
     *  @param {object} [options.headers=null] headers to send.
     *  @param {boolean} [options.processData=true] Data should be processed.
     *  @param {boolean} [options.contentType=true] Wether cCntent-Type should be changed.
     *  @param {boolean} [options.rejectAbort=true] XHR abort/cancel will reject promise.
     *  @param {function} [options.beforeSend] A callback function to allow modification of the XHR object before it is send.
     * @returns {Promise}
     *
     * @example
     *
     * rb.fetch('api/user.json?id=12')
     *  .then(function(response, xhr){
     *      console.log(response.data);
     *  });
     */
    rb.fetch = function (url, options) {
        if ((typeof url === 'undefined' ? 'undefined' : _typeof(url)) == 'object') {
            options = url;
            url = options.url;
        }

        options = Object.assign({
            type: 'get',
            username: undefined,
            password: undefined,
            processData: true,
            contentType: true,
            rejectAbort: true
        }, options);

        var abort = void 0;
        var oReq = new XMLHttpRequest();
        var promise = rb.deferred();

        (function () {
            var header = void 0;
            var isAborted = false;
            var data = options.data || null;

            var value = { opts: options };

            var createAbort = function createAbort() {
                var abortCb = $.Callbacks();

                abort = function abort() {
                    if (oReq) {
                        getData(oReq, value);
                        isAborted = true;
                        oReq.abort();

                        value.status = 'canceled';
                        promise.catch(rb.logWarn);
                        abortCb.fire(value);

                        if (options.rejectAbort) {
                            promise.reject(value);
                        }
                    }
                };

                promise.abort = abort;

                promise.onAbort = abortCb.add;
                promise.offAbort = abortCb.remove;
            };

            oReq.addEventListener('load', function () {
                var status = oReq.status;
                var isSuccess = status >= 200 && status < 300 || status == 304;

                if (isAborted) {
                    return;
                }

                getData(oReq, value);

                promise.catch(rb.logWarn);

                if (isSuccess) {
                    promise.resolve(value, oReq);
                } else {
                    promise.reject(value, oReq);
                }

                oReq = null;
            });

            oReq.addEventListener('error', function () {
                if (isAborted) {
                    return;
                }

                getData(oReq, value);
                promise.catch(rb.logWarn);
                promise.reject(value, oReq);
                oReq = null;
            });

            options.type = options.type.toUpperCase();

            if (options.processData && data && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) == 'object') {

                if ($.param) {
                    data = $.param(data);
                } else if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
                    rb.logError('no $.param for fetch stringify');
                }

                if (options.type == 'GET') {
                    url += (regQuery.test(url) ? '&' : '?') + data;
                    data = null;
                }
            }

            oReq.open(options.type, url, true, options.username, options.password);

            if ((!options.headers || !options.headers['Content-type']) && options.contentType) {
                if (options.type == 'POST' && typeof data == 'string') {
                    oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                }
            }

            if (options.headers) {
                for (header in options.headers) {
                    oReq.setRequestHeader(header, options.headers[header]);
                }
            }

            if (options.beforeSend) {
                options.beforeSend(oReq);
            }

            promise.abort = function () {
                createAbort();
                return promise.abort.apply(promise, arguments);
            };

            promise.onAbort = function () {
                createAbort();
                return promise.add.apply(promise, arguments);
            };

            promise.offAbort = function () {
                createAbort();
                return promise.remove.apply(promise, arguments);
            };

            promise.getXhr = function () {
                return oReq;
            };

            oReq.send(data);
        })();

        return promise;
    };

    exports.default = rb.fetch;
});
