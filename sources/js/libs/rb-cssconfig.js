if(!window.rb){
	window.rb = {};
}

(function(){
	'use strict';

	var rb = window.rb;

	var regStartQuote = /^"?'?"?/;
	var regEndQuote = /"?'?"?$/;
	var regEscapedQuote = /\\"/g;

	var removeLeadingQuotes = function(str){
		return (str || '').replace(regStartQuote, '').replace(regEndQuote, '').replace(regEscapedQuote, '"');
	};

	/**
	 * Parses a string using JSON.parse without throwing an error.
	 * @memberof rb
	 * @param str
	 * @returns {Object}
	 */
	rb.jsonParse = function(str){
		var ret = null;
		try {
			ret = JSON.parse(str);
		} catch(e){}
		return ret;
	};

	/**
	 * Parses the CSS content value of a pseudo element using JSON.parse.
	 * @memberof rb
	 * @param element {Element} The element to parse.
	 * @param [pseudo='::after'] {String}
	 * @returns {Object|undefined}
	 */
	rb.parsePseudo = function(element, pseudo){
		var ret;
		var value = typeof element == 'string' ?
				element :
				rb.getStyles(element, pseudo || '::after').content
			;
		ret = rb.jsonParse(removeLeadingQuotes(value));
		return ret;
	};

	/**
	 * Returns the ComputedStyleObject of an element.
	 * @memberof rb
	 * @param elem {Element}
	 * @param [pseudo]
	 * @returns {CssStyle}
	 */
	rb.getStyles = function(elem, pseudo){
		var view = elem.ownerDocument.defaultView;

		if(!view.opener){
			view = window;
		}
		return view.getComputedStyle(elem, pseudo || null) || {getPropertyValue: rb.$ && rb.$.noop};
	};

	/**
	 * Parsed global data from Stylesheet (html::before and html::after)
	 * @alias rb.cssConfig
	 * @property cssConfig {Object}
	 * @property cssConfig.mqs {Object} Map of different media queries
	 * @property cssConfig.currentMQ {String} Currently active media query
	 * @property cssConfig.beforeMQ {String} Media query that was active before
	 * @property cssConfig.mqChange {Object} jQuery Callback object to listen for media query changes.
	 *
	 */
	var cssConfig = {mqs: {}, currentMQ: '', beforeMQ: ''};
	var parseCSS = function(){
		var mqCallbacks;
		var root = document.documentElement;
		var styles = rb.parsePseudo(root) || {};
		var beforeStyle = rb.getStyles(root, '::before');
		var currentStyle = '';

		var detectMQChange = function(){
			var nowStyle = beforeStyle.content;
			if(currentStyle != nowStyle){
				currentStyle = nowStyle;
				rb.cssConfig.beforeMQ = rb.cssConfig.currentMQ;
				rb.cssConfig.currentMQ = removeLeadingQuotes(currentStyle);
				if(rb.$ && rb.$.Callbacks){
					rb.cssConfig.mqChange.fireWith(rb.cssConfig);
				}
			}
		};

		Object.defineProperty(rb, 'cssConfig', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: Object.assign(cssConfig, styles)
		});

		Object.defineProperty(cssConfig, 'mqChange', {
			configurable: true,
			enumerable: true,
			get: function(){
				if(!mqCallbacks){
					rb.resize.on(detectMQChange);
					mqCallbacks = rb.$.Callbacks();
				}

				return mqCallbacks;
			}
		});

		detectMQChange();
	};

	Object.defineProperty(rb, 'cssConfig', {
		configurable: true,
		enumerable: true,
		get: function(){
			parseCSS();
			return cssConfig;
		}
	});
})();
