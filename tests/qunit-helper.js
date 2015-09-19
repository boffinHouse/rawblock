(function(){
	'use strict';
	var size = {
		width: 300,
		height: 400,
	};
	var rbTest = {
		_iframe: null,
		resize: function(width, height){
			if(!width){
				width = size.width;
			}
			if(!height){
				height = size.height;
			}
			this._iframe.style.width = width + 'px';
			this._iframe.style.height = height + 'px';
			return this;
		},
		load: function(src){
			var that = this;
			if(!this._iframe){
				this._iframe = document.createElement('iframe');
				this._iframe.style.position = 'absolute';
				this._iframe.style.top = '-99999999px';
				this._iframe.style.left = '-99999999px';
				document.body.appendChild(this._iframe);
			}
			this.resize();

			this.promise = new Promise(function(resolve){
				var complete = function(){
					that._iframe.removeEventListener('load', complete);
					that._iframe.removeEventListener('error', complete);
					that.win = that._iframe.contentWindow;
					that.doc = that.win.document;

					QUnit.afterAF(resolve);
				};
				that._iframe.addEventListener('load', complete);
				that._iframe.addEventListener('error', complete);
				that._iframe.src = src;
			});


			return this;
		},
		wait: function(delay){
			var that = this;
			var promise = QUnit.afterAF(delay);
			this.promise.then(function(){
				return promise;
			});
			that.promise = promise;
			return this;
		},
		then: function(fn){
			this.promise.then(fn);
			return this;
		}
	};

	QUnit.afterAF = function(cb, delay){
		if(typeof cb == 'number'){
			delay = cb;
			cb = false;
		}

		var promise = new Promise(function(resolve){
			var resolveIt = function(){
				resolve();
				if(cb){
					cb();
				}
			};
			var afterFrame = function(){
				requestAnimationFrame(function(){
					setTimeout(resolveIt);
				});
			};

			if(delay){
				setTimeout(afterFrame, delay);
			} else {
				afterFrame();
			}
		});

		return promise;
	};

	Object.assign(QUnit.assert, {
		numberClose: function (actual, expected, maxDifference, message) {
			if(!maxDifference){
				maxDifference = 1;
			}
			var actualDiff = (actual === expected) ? 0 : Math.abs(actual - expected),
				result = actualDiff <= maxDifference;
			message = message || (actual + " should be within " + maxDifference + " (inclusive) of " + expected + (result ? "" : ". Actual: " + actualDiff));
			this.push(result, actual, expected, message);
		}
	});



	window.rbTest = rbTest;
})();
