(function(){
	'use strict';
	var size = {
		width: 300,
		height: 400,
	};
	var rbTest = {
		_iframe: null,
		_resize: function(width, height){
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
		resize: function(){
			var that = this;
			var args = arguments;
			this.promise.then(function(){
				that._resize.apply(that, args);
			});
			return this.wait();
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
			this._resize();

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


	(function(){
		var getElementPos = function(elem){
			var pos = elem.getBoundingClientRect();

			return {
				clientX: pos.left + ((pos.width || 1) / 2),
				clientY: pos.left + ((pos.height || 1) / 2)
			};
		};
		var actions = {
			mouse: {
				dispatch: function(elem, type, props){
					var event = new MouseEvent(type,
						Object.assign(
							getElementPos(elem),
							{bubbles: true},
							props
						)
					);
					elem.dispatchEvent(event);
				},
				reg: /^mouse|click$/
			},
			//drag: {
			//	dispatch: function(){
			//
			//	},
			//	reg: /^drag/
			//},
			flick: {
				dispatch: function(elem, type, props, options){
					var interval, startProps;
					var now = Date.now();
					var elemPos = getElementPos(elem);
					options = Object.assign({duration: 200, x: 0, y: 0}, options);

					props = Object.assign(elemPos, props);
					startProps = Object.assign({}, props);
					actions.mouse.dispatch(elem, 'mousedown', props);

					interval = setInterval(function(){
						var pos = (Date.now() - now) / options.duration;

						if(pos > 1){
							pos = 1;
						}

						props.clientX = Math.round(startProps.clientX + (options.x * pos));
						props.clientY = Math.round(startProps.clientY + (options.y * pos));

						actions.mouse.dispatch(elem, 'mousemove', props);

						if(pos >= 1){
							clearInterval(interval);
							setTimeout(function(){
								actions.mouse.dispatch(elem, 'mouseup', props);
							});
						}
					}, 17);

				},
				reg: /^flick/
			},

			'': {
				dispatch: function(elem, type, props, options){

				},
				reg: /.*/
			}
		};

		rbTest.simulate = function(elem, type, props, options){
			var action;
			var actionType = type;
			if(!actions[actionType]){
				for(action in actions){
					if(actions[action].reg.test(actionType)){
						actionType = action;
						break;
					}
				}
			}
			actions[actionType].dispatch(elem, type, props, options);
		};
	})();

	window.rbTest = rbTest;
})();
