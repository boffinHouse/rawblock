(function (factory) {
	if (typeof module === 'object' && module.exports) {
		require('./rb_itemscroller');
		module.exports = factory();
	} else {
		factory();
	}
} (function() {
	'use strict';
	var rb = window.rb;
	var regComma = /\s*?,\s*?/;
	var regColon = /\s*?:\s*?/;
	var regUnit = /(px|%)$/;

	var createCondition = function(value){
		var unit;
		var obj = {
			condition: Number.MAX_VALUE,
			str: value,
		};
		value = value.split(regColon);

		if(value.length == 1){
			obj.css = value[0];
		} else {
			obj.condition = parseFloat(value[0]);
			obj.css = value[1];
		}

		unit = obj.css.match(regUnit);
		obj.unit = unit && unit[1] || 'px';
		obj.value = parseFloat(obj.css);

		return obj;
	};

	var ItemScroller = rb.Component.mixin(rb.components.itemscroller,
		/** @lends rb.components.itemscroller.prototype */
		{
			/**
			 * @static
			 * @mixes rb.components.itemscroller.prototype.defaults
			 * @prop {String} queries="" Container queries configuration represented by a `sizes` like comma separated string. `"maxWidthCondition1:cellWidthSize1(%|px), maxWidthCondition2:cellWidthSize2(%|px), defaultCellWidthSize(%|px)"` (i.e.: `"500:100%, 860:50%, 33.333%"`).
			 */
			defaults: {
				queries: '',
			},
			_parseQueries: function(){
				var queries = this.options.queries;
				if(!queries){
					this._parsedQueries = null;
					return;
				}
				if(this._parsedQueries && this._parsedQueries.queryString == queries){return;}

				this._parsedQueries = queries.split(regComma).map(createCondition);
				this._parsedQueries.queryString = queries;
			},
			setOption: function(name, value){
				this._super(name, value);

				if(name == 'queries'){
					this.calculateLayout();
				}
			},
			_getCellWidth: function _getCellWidth(){
				return this._parsedQueries && this._parsedQueries.currentQuery ?
					this._parsedQueries.currentQuery.computedValue :
					_getCellWidth._supbase.apply(this, arguments)
				;
			},
			_getCurrentQuery: function(){
				if(!this._parsedQueries){return;}
				var currentQuery, i;

				for(i = 0; i < this._parsedQueries.length; i++){
					currentQuery = this._parsedQueries[i];
					if(this.viewportWidth < currentQuery.condition){
						break;
					}
				}

				currentQuery.computedValue = currentQuery.unit == '%' ?
					this.viewportWidth * currentQuery.value / 100 :
					currentQuery.value
				;

				if(currentQuery != this._parsedQueries.currentQuery){
					this._parsedQueries.currentQuery = currentQuery;
					this._setCurrentQuery();
				}
			},
			_setCurrentQuery: rb.rAF(function(){
				if(this._parsedQueries && this._parsedQueries.currentQuery){
					this.$cells.css({width: this._parsedQueries.currentQuery.css});
				}
			}, {batch: true}),
			_switchOff: function _switchOff(){
				var ret = _switchOff._supbase.apply(this, arguments);
				if(this._parsedQueries && this._parsedQueries.currentQuery){
					this._parsedQueries.currentQuery = null;
					this.$cells.css({width: ''});
				}
				return ret;
			},
			_calculateCellLayout: function _calculateCellLayout(){
				this._parseQueries();
				this._getCurrentQuery();

				return _calculateCellLayout._supbase.apply(this, arguments);
			}
		}
	);

	return ItemScroller;
}));
