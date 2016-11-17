(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'babel-runtime/helpers/typeof', './itemscroller'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('babel-runtime/helpers/typeof'), require('./itemscroller'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global._typeof, global.itemscroller);
        global.itemscrollerQueries = mod.exports;
    }
})(this, function (module, _typeof2) {
    'use strict';

    var _typeof3 = _interopRequireDefault(_typeof2);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    (function (factory) {
        if ((typeof module === 'undefined' ? 'undefined' : (0, _typeof3.default)(module)) === 'object' && module.exports) {
            module.exports = factory();
        } else {
            factory();
        }
    })(function () {
        'use strict';

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

        var ItemScroller = rb.Component.mixin(rb.components.itemscroller,
        /** @lends rb.components.itemscroller.prototype */
        {
            /**
             * @static
             * @mixes rb.components.itemscroller.prototype.defaults
             * @prop {String} queries="" Container queries configuration represented by a `sizes` like comma separated string. `"(max-width: 480px) cellWidthSize1(%|px), (max-width: 1024px) cellWidthSize2(%|px), defaultCellWidthSize(%|px)"` (i.e.: `"(max-width: 480px) 100%, (max-width: 1024px) 50%, 600px"`).
             * @prop {String} modifyUsePx=true Wether the `usePx` option should automatically changed.
             */
            defaults: {
                queries: '',
                modifyUsePx: true
            },
            _parseQueries: function _parseQueries() {
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
            },
            setOption: function setOption(name, value) {
                this._super(name, value);

                if (name == 'queries') {
                    this.calculateLayout();
                }
            },
            _getCellWidth: function _getCellWidth() {
                return this._parsedQueries && this._parsedQueries.currentQuery ? this._parsedQueries.currentQuery.computedValue : _getCellWidth._supbase.apply(this, arguments);
            },
            _getCurrentQuery: function _getCurrentQuery() {
                if (!this._parsedQueries) {
                    return;
                }
                var currentQuery, i;

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
            },
            _setCurrentQuery: rb.rAF(function () {
                if (this._parsedQueries && this._parsedQueries.currentQuery) {
                    this.$cells.css({ width: this._parsedQueries.currentQuery.css });
                }
            }, { batch: true }),
            _switchOff: function _switchOff() {
                var ret = _switchOff._supbase.apply(this, arguments);
                if (this._parsedQueries && this._parsedQueries.currentQuery) {
                    this._parsedQueries.currentQuery = null;
                    this.$cells.css({ width: '' });
                }
                return ret;
            },
            _calculateCellLayout: function _calculateCellLayout() {
                this._parseQueries();
                this._getCurrentQuery();

                return _calculateCellLayout._supbase.apply(this, arguments);
            }
        });

        return ItemScroller;
    });
});
