import './deferred';

const rb = window.rb;
const $ = rb.$;
const regQuery = (/\?/);
const getData = function (oReq, obj) {
    obj.xhr = oReq;
    obj.data = oReq.response || oReq.responseXML || oReq.responseText;
    obj.text = oReq.responseText;
    obj.xml = oReq.responseXML;
    obj.status = oReq.status;

    if (typeof obj.data != 'object' &&
        (oReq.getResponseHeader('Content-Type') || '').split(';')[0].endsWith('json')) {
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
    if (typeof url == 'object') {
        options = url;
        url = options.url;
    }

    options = Object.assign({
        type: 'get',
        username: undefined,
        password: undefined,
        processData: true,
        contentType: true,
        rejectAbort: true,
    }, options);

    let abort;
    let oReq = new XMLHttpRequest();
    const promise = rb.deferred();

    (function () {
        let header;
        let isAborted = false;
        let data = options.data || null;

        const value = {opts: options};

        const createAbort = function(){
            const abortCb = $.Callbacks();

            abort = function(){
                if(oReq){
                    getData(oReq, value);
                    isAborted = true;
                    oReq.abort();

                    value.status = 'canceled';
                    promise.catch(rb.logWarn);
                    abortCb.fire(value);

                    if(options.rejectAbort){
                        promise.reject(value);
                    }
                }
            };

            promise.abort = abort;

            promise.onAbort = abortCb.add;
            promise.offAbort = abortCb.remove;
        };

        oReq.addEventListener('load', function () {
            const status = oReq.status;
            const isSuccess = status >= 200 && status < 300 || status == 304;

            if(isAborted){return;}

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
            if(isAborted){return;}

            getData(oReq, value);
            promise.catch(rb.logWarn);
            promise.reject(value, oReq);
            oReq = null;
        });



        options.type = options.type.toUpperCase();

        if(options.processData && data && typeof data == 'object'){

            if($.param){
                data = $.param(data);
            } else if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
                rb.logError('no $.param for fetch stringify');
            }

            if(options.type == 'GET'){
                url += (regQuery.test(url) ? '&' : '?') + data;
                data = null;
            }
        }

        oReq.open(options.type, url, true, options.username, options.password);

        if((!options.headers || !options.headers['Content-type']) && options.contentType){
            if(options.type == 'POST' && typeof data == 'string'){
                oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            }
        }

        if(options.headers){
            for(header in options.headers){
                oReq.setRequestHeader(header, options.headers[header]);
            }
        }

        if (options.beforeSend) {
            options.beforeSend(oReq);
        }

        promise.abort = function(){
            createAbort();
            return promise.abort(...arguments);
        };

        promise.onAbort = function(){
            createAbort();
            return promise.add(...arguments);
        };

        promise.offAbort = function(){
            createAbort();
            return promise.remove(...arguments);
        };

        promise.getXhr = function(){
            return oReq;
        };

        oReq.send(data);
    })();

    return promise;
};

export default rb.fetch;
