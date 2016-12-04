if (!window.rb) {
    window.rb = {};
}

const rb = window.rb;
const $ = rb.$;
const regQuery = ( /\?/ );
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
 *  @param {String|null} [options.username=null] The URL for the request.
 *  @param {String|null} [options.password=null] The URL for the request.
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
        username: null,
        password: null,
        processData: true,
        contentType: true,
        rejectAbort: true,
    }, options);

    let abort;
    let oReq = new XMLHttpRequest();
    const abortCb = $.Callbacks();
    const promise = rb.deferred();

    (function () {
        var header;
        let data = options.data || null;
        const value = {opts: options};
        let isAborted = false;

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

        options.type = options.type.toUpperCase();

        if(options.processData && data && $.param && typeof data == 'object'){
            data = $.param(data);

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

        promise.abort = abort;

        promise.onAbort = abortCb.add;
        promise.offAbort = abortCb.remove;

        promise.getXhr = function(){
            return oReq;
        };

        oReq.send(data);
    })();

    return promise;
};

export default rb.fetch;
