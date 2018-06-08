(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '../core', './itemscroller'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('../core'), require('./itemscroller'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.core, global.itemscroller);
        global.itemscrollerPagination = mod.exports;
    }
})(this, function (exports, _core) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _core2 = _interopRequireDefault(_core);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
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

    var $ = _core.Component.$;

    var ItemScrollerPagination = function (_rb$components$itemsc) {
        _inherits(ItemScrollerPagination, _rb$components$itemsc);

        _createClass(ItemScrollerPagination, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    paginationFor: ''
                };
            }
        }]);

        function ItemScrollerPagination(element, initialDefaults) {
            _classCallCheck(this, ItemScrollerPagination);

            var _this = _possibleConstructorReturn(this, _rb$components$itemsc.call(this, element, initialDefaults));

            _this.updateScrollerAsPagination = _core2.default.rAF(_this.updateScrollerAsPagination, { that: _this });

            if (_this.options.paginationFor) {
                _this.setOption('paginationFor', _this.options.paginationFor);
            }
            return _this;
        }

        ItemScrollerPagination.prototype.setOption = function setOption(name, value, isSticky) {
            _rb$components$itemsc.prototype.setOption.call(this, name, value, isSticky);

            if (name == 'paginationFor') {
                if (value) {
                    this._setupScrollerAsPagination();
                } else {
                    this._teardownScrollerAsPagination();
                }
            }
        };

        ItemScrollerPagination.prototype.updateScrollerAsPagination = function updateScrollerAsPagination() {
            var cell;
            var selectedIndex = this.groupedMainComponent.selectedIndex;

            if (!this.$cells || !this.$cells.length) {
                return;
            }

            this.$cells.rbToggleState('selected{-}pagination', false);

            cell = this.$cells.eq(selectedIndex).rbToggleState('selected{-}pagination', true).get(0);

            if (this.isCellVisible(cell) !== true) {
                this.selectCell(selectedIndex);
            }
        };

        ItemScrollerPagination.prototype._setupScrollerAsPagination = function _setupScrollerAsPagination() {
            this._teardownScrollerAsPagination();
            var paginationFor = this.options.paginationFor;
            if (!paginationFor) {
                return;
            }

            this.groupedMainElement = _core2.default.elementFromStr(paginationFor, this.element)[0] || null;

            if (!this.groupedMainElement) {
                return;
            }

            this.groupedMainComponent = this.component(this.groupedMainElement);

            if (!this.groupedMainComponent) {
                return;
            }

            $(this.groupedMainElement).on(this.groupedMainComponent._evtName, this.updateScrollerAsPagination);
            this.updateScrollerAsPagination();
        };

        ItemScrollerPagination.prototype._teardownScrollerAsPagination = function _teardownScrollerAsPagination() {
            if (this.groupedMainComponent && this.groupedMainElement) {
                $(this.groupedMainElement).off(this.groupedMainComponent._evtName, this.updateScrollerAsPagination);
                this.groupedMainComponent = null;
                this.groupedMainElement = null;
            }
        };

        _createClass(ItemScrollerPagination, null, [{
            key: 'events',
            get: function get() {
                return {
                    'click:closest(.{name}{e}cell)': function clickClosestNameECell(e) {
                        if (!this.groupedMainComponent) {
                            return;
                        }
                        this.groupedMainComponent.selectedIndex = this.$cells.index(e.delegatedTarget || e.currentTarget);
                    }
                };
            }
        }]);

        return ItemScrollerPagination;
    }(_core2.default.components.itemscroller);

    _core.Component.register('itemscroller', ItemScrollerPagination, true);

    exports.default = ItemScrollerPagination;
});
