(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';

    if (!window.rb) {
        window.rb = {};
    }

    var rb = window.rb;

    var getData = function (oReq) {
        var data = oReq.responseXML || oReq.responseText;
        var contentType = (oReq.getResponseHeader('Content-Type') || '').split(';')[0];
        if (contentType.endsWith('json')) {
            data = rb.jsonParse(oReq.responseText) || data;
        }
        return data;
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
        }, options);

        var promise = new Promise(function (resolve, reject) {
            var header;
            var oReq = new XMLHttpRequest();

            oReq.addEventListener('load', function () {
                var value;
                var status = oReq.status;
                var isSuccess = status >= 200 && status < 300 || status == 304;

                value = {data: getData(oReq)};

                if (isSuccess) {
                    resolve(value, oReq);
                } else {
                    reject(value, oReq);
                }
                oReq = null;
            });

            oReq.addEventListener('error', function () {
                var value = {data: getData(oReq)};
                reject(value, oReq);
                oReq = null;
            });

            oReq.open(options.type.toUpperCase(), url, true, options.username, options.password);

            if(options.headers){
                for(header in options.headers){
                    oReq.setRequestHeader(header, options.headers[header]);
                }
            }

            if (options.beforeSend) {
                options.beforeSend(oReq);
            }

            oReq.send(options.data || null);
        });

        return promise;
    };

    return rb.fetch;
}));
