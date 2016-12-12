(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './itemscroller'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./itemscroller'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.itemscroller);
        global.itemscrollerQueries = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var rb = window.rb;
    var regSizes = /(\(\s*(min|max)(-width)?\s*:\s*(\d+\.*\d*)(px)?\)\s*)?(\d+\.*\d*)(px|%)?/g;

    var createConditions = rb.memoize(function (value) {

        var match, size;

        var sizes = [];

        while (match = regSizes.exec(value)) {
            size = {
                condition: parseFloat(match[4]),
                type: match[2],
                str: match[0],
                value: parseFloat(match[6]),
                unit: match[7] || 'px'
            };

            size.css = size.value + size.unit;

            sizes.push(size);
        }

        return sizes;
    }, true);

    var ItemScrollerQueries = function (_rb$components$itemsc) {
        _inherits(ItemScrollerQueries, _rb$components$itemsc);

        function ItemScrollerQueries() {
            _classCallCheck(this, ItemScrollerQueries);

            return _possibleConstructorReturn(this, _rb$components$itemsc.apply(this, arguments));
        }

        ItemScrollerQueries.prototype.beforeConstruct = function beforeConstruct() {
            _rb$components$itemsc.prototype.beforeConstruct.call(this);

            this.rAFs({ batch: true }, '_setCurrentQuery');
        };

        ItemScrollerQueries.prototype._parseQueries = function _parseQueries() {
            var queries = this.options.queries;

            if (!queries) {
                this._parsedQueries = null;
                return;
            }
            if (this._parsedQueries && this._parsedQueries.queryString == queries) {
                return;
            }

            this._parsedQueries = createConditions(queries);
            this._parsedQueries.queryString = queries;
        };

        ItemScrollerQueries.prototype.setOption = function setOption(name, value, isSticky) {
            _rb$components$itemsc.prototype.setOption.call(this, name, value, isSticky);

            if (name == 'queries') {
                this.calculateLayout();
            }
        };

        ItemScrollerQueries.prototype._getCellWidth = function _getCellWidth(element) {
            return this._parsedQueries && this._parsedQueries.currentQuery ? this._parsedQueries.currentQuery.computedValue : _rb$components$itemsc.prototype._getCellWidth.call(this, element);
        };

        ItemScrollerQueries.prototype._getCurrentQuery = function _getCurrentQuery() {
            if (!this._parsedQueries) {
                return;
            }
            var currentQuery = void 0,
                i = void 0;

            for (i = 0; i < this._parsedQueries.length; i++) {
                currentQuery = this._parsedQueries[i];
                if (!currentQuery.condition || !currentQuery.type || currentQuery.type == 'max' && this.viewportWidth <= currentQuery.condition || currentQuery.type == 'min' && this.viewportWidth >= currentQuery.condition) {
                    break;
                }
            }

            currentQuery.computedValue = currentQuery.unit == '%' ? this.viewportWidth * currentQuery.value / 100 : currentQuery.value;

            if (this.options.modifyUsePx) {
                this.options.usePx = currentQuery.unit == 'px';
            }

            if (currentQuery != this._parsedQueries.currentQuery) {
                this._parsedQueries.currentQuery = currentQuery;
                this._setCurrentQuery();
            }
        };

        ItemScrollerQueries.prototype._setCurrentQuery = function _setCurrentQuery() {
            if (this._parsedQueries && this._parsedQueries.currentQuery) {
                this.$cells.css({ width: this._parsedQueries.currentQuery.css });
            }
        };

        ItemScrollerQueries.prototype._switchOff = function _switchOff() {
            var ret = _rb$components$itemsc.prototype._switchOff.call(this);

            if (this._parsedQueries && this._parsedQueries.currentQuery) {
                this._parsedQueries.currentQuery = null;
                this.$cells.css({ width: '' });
            }
            return ret;
        };

        ItemScrollerQueries.prototype._calculateCellLayout = function _calculateCellLayout() {
            this._parseQueries();
            this._getCurrentQuery();

            return _rb$components$itemsc.prototype._calculateCellLayout.call(this);
        };

        _createClass(ItemScrollerQueries, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    queries: '',
                    modifyUsePx: true
                };
            }
        }]);

        return ItemScrollerQueries;
    }(rb.components.itemscroller);

    rb.live.register('itemscroller', ItemScrollerQueries, true);

    exports.default = ItemScrollerQueries;
});
