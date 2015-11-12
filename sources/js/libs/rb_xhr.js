(function(){
	'use strict';
	if(!window.rb){
		window.rb = {};
	}

	var rb =  window.rb;

	/**
	 * @memberof rb
	 * @param {String} url
	 * @param {Object} [options]
	 * @returns {Promise}
	 */
	rb.xhr = function(url, options){
		if(typeof url == 'object'){
			options = url;
			url = options.url;
		}
		options = Object.assign({
			type: 'get',
			username: null,
			password: null
		}, options);

		var promise = new Promise(function(resolve, reject){
			var oReq = new XMLHttpRequest();
			oReq.addEventListener('load', function(){
				var data = oReq.responseXML || oReq.responseText;
				var status = oReq.status;
				var isSuccess = status >= 200 && status < 300 || status === 304;

				if(oReq.getResponseHeader('Content-Type') == 'application/json'){
					try {
						data = JSON.parse(oReq.responseText);
					} catch(e){}
				}

				if(isSuccess){
					resolve([data, oReq.statusText, oReq]);
				} else {
					reject([data, oReq.statusText, oReq]);
				}
				oReq = null;
			});
			oReq.addEventListener('error', function(){
				var data = oReq.responseXML || oReq.responseText;

				reject([data, oReq.statusText, oReq]);
				oReq = null;
			});
			oReq.open(options.type.toUpperCase(), url, true, options.username, options.password);

			if(options.beforeSend){
				options.beforeSend(oReq);
			}

			oReq.send(options.data || null);
		});

		return promise;
	};
})();
