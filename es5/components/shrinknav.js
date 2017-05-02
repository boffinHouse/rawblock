(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '../utils/resize'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('../utils/resize'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.resize);
        global.shrinknav = mod.exports;
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

    var regPoint = /^./;
    var rb = window.rb;
    var $ = rb.$;

    /**
     * Class component to create a ShrinkNav.
     *
     * @alias rb.components.shrinknav
     *
     * @extends rb.Component
     *
     * @param element {Element}
     * @param [initialDefaults] {OptionsObject}
     *
     * @fires componentName#changed
     *
     * @example
     * <div class="js-rb-live" data-module="shrinknav"></div>
     */

    var ShrinkNav = function (_rb$Component) {
        _inherits(ShrinkNav, _rb$Component);

        _createClass(ShrinkNav, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    measureElement: 'self',
                    items: '.children(.{name}{e}item)',
                    toggleItemSelector: '.is{-}toggle{-}item',
                    togglePanel: 'find(.{name}{e}panel)',
                    minItems: 2,
                    minSubItems: 2,
                    growItems: false
                };
            }
        }, {
            key: 'events',
            get: function get() {
                return {
                    'rb_resize': 'measureElements'
                };
            }
        }]);

        function ShrinkNav(element, initialDefaults) {
            _classCallCheck(this, ShrinkNav);

            var _this = _possibleConstructorReturn(this, _rb$Component.call(this, element, initialDefaults));

            _this.rAFs('addItemsTo');

            _this.reflow = rb.throttle(_this.measureElements);

            _this._getMeasureElement();
            _this._getItems();
            _this._calcMinItems();

            _this.measureElements();
            return _this;
        }

        ShrinkNav.prototype.setOption = function setOption(name, value, isSticky) {
            _rb$Component.prototype.setOption.call(this, name, value, isSticky);

            if (name == 'measureElement') {
                this._getMeasureElement();
                this.reflow();
            } else if (name == 'minSubItems' || name == 'minItems') {
                this._calcMinItems();
                this.reflow();
            }
        };

        ShrinkNav.prototype._switchOff = function _switchOff() {};

        ShrinkNav.prototype._switchOn = function _switchOn() {};

        ShrinkNav.prototype._calcMinItems = function _calcMinItems() {
            var fullLength = this.allItems.length;
            var _options = this.options,
                minSubItems = _options.minSubItems,
                minItems = _options.minItems;

            var needItems = minSubItems + minItems;

            if (needItems > fullLength) {
                if (minItems < fullLength) {
                    this.minSubItems = fullLength - minItems;
                } else {
                    this.minItems = 0;
                    this.minSubItems = 0;
                }
            } else {
                this.minItems = minItems;
                this.minSubItems = minSubItems;
            }

            if (this.minItems < 2) {
                this.minItems = 0;
            }

            if (this.minSubItems < 2) {
                this.minSubItems = 0;
            }
        };

        ShrinkNav.prototype.hideItems = function hideItems() {
            var _this2 = this;

            var hideItems = [];

            var currentMenuLength = this.panelmenuItems.length;
            var currentVisibleLength = this.mainbarItems.length;

            this.mainbarItems.forEach(function (item) {
                if (_this2.remainingWidth < 0 || currentMenuLength < _this2.minSubItems || currentVisibleLength < _this2.minItems) {
                    hideItems.push(item);

                    currentVisibleLength--;
                    currentMenuLength++;
                }
                _this2.remainingWidth += item.width;
            });

            this.addItemsTo(hideItems);
        };

        ShrinkNav.prototype.showElements = function showElements() {
            var _this3 = this;

            var run = true;
            var changeItems = [];
            var lastIndex = this.panelmenuItems.length - 1;
            var currentMenuLength = this.panelmenuItems.length;
            var currentVisibleLength = this.mainbarItems.length;

            this.panelmenuItems.forEach(function (item, index) {
                if (run) {
                    if (index == lastIndex) {
                        _this3.remainingWidth += _this3.toggleItemWidth;
                    }

                    if (_this3.remainingWidth > item.width) {
                        changeItems.push(item);

                        currentVisibleLength++;
                        currentMenuLength--;

                        _this3.remainingWidth -= item.width;
                    } else {
                        run = false;
                    }
                }
            });

            if (currentMenuLength) {
                while (changeItems.length && currentMenuLength < this.minSubItems) {
                    changeItems.pop();

                    currentVisibleLength--;
                    currentMenuLength++;
                }

                if (currentVisibleLength < this.minItems) {
                    return;
                }
            }

            if (changeItems.length) {
                this.addItemsTo(changeItems, true);
            }
        };

        ShrinkNav.prototype.addItemsTo = function addItemsTo(items, isVisibleBar) {
            var hadSubmenu = !!this.panelmenuItems.length;

            if (isVisibleBar) {
                items.forEach(this.addItemToBar, this);
            } else {
                items.forEach(this.addItemToPanel, this);
            }

            var hasMenus = !!this.panelmenuItems.length;

            if (this.hasSubmenu !== hasMenus) {
                this.hasSubmenu = hasMenus;
                this.$element.rbToggleState('submenu-within', hasMenus);
            }

            this.trigger({ hadSubmenu: hadSubmenu, changedItems: items, setToBar: !!isVisibleBar });
        };

        ShrinkNav.prototype.addItemToBar = function addItemToBar(item) {
            var index = this.panelmenuItems.indexOf(item);

            var setElement = false;
            var position = item.position - 1;

            while (position >= 0 && !setElement) {
                var posItem = this.allItems[position];

                if (posItem && posItem.parent == posItem.$item.parent().get(0)) {
                    posItem.$item.after(item.$item);
                    setElement = true;
                    break;
                }

                position--;
            }

            if (!setElement) {
                $(item.parent).prepend(item.$item);
            }

            if (index != -1) {
                this.panelmenuItems.splice(index, 1);
                this.mainbarItems.unshift(item);
            }
        };

        ShrinkNav.prototype.addItemToPanel = function addItemToPanel(item) {
            var index = this.mainbarItems.indexOf(item);

            this.$submenu.prepend(item.$item);

            if (index != -1) {
                this.mainbarItems.splice(index, 1);
                this.panelmenuItems.unshift(item);
            }
        };

        ShrinkNav.prototype.measureElements = function measureElements() {
            var add = this.options.growItems ? -0.1 : 0.1;
            var panelmenuItems = this.panelmenuItems;


            this.innerWidth = this.$measureElement.innerWidth();

            this.neededWidth = this.mainbarItems.reduce(function (value, item) {
                item.width = item.$item.outerWidth() + add;
                return value + item.width;
            }, 0);

            this.toggleItemWidth = this.$toggleItem.outerWidth() || this.toggleItemWidth || 0;
            this.remainingWidth = this.innerWidth - this.neededWidth - this.toggleItemWidth;

            if (this.remainingWidth < (panelmenuItems.length ? 0 : -this.toggleItemWidth) + 0.1) {
                this.hideItems();
            } else if (this.panelmenuItems.length) {
                var itemWidth = panelmenuItems.length == 1 ? panelmenuItems[0].width - this.toggleItemWidth : panelmenuItems[0].width;

                if (this.remainingWidth > itemWidth + 0.1) {
                    this.showElements();
                }
            }
        };

        ShrinkNav.prototype._getItems = function _getItems() {
            var _this4 = this;

            var _options2 = this.options,
                items = _options2.items,
                toggleItemSelector = _options2.toggleItemSelector,
                togglePanel = _options2.togglePanel;


            var toggleItem = this.query(toggleItemSelector);

            this.$submenu = $(this.getElementsByString(togglePanel)[0]);

            this.$toggleItem = $(toggleItem);

            this.allItems = this.getElementsByString(items).filter(function (item) {
                return item != toggleItem;
            }).map(function (item, position) {
                return {
                    $item: $(item),
                    width: 0,
                    position: position,
                    parent: item.parentNode,
                    priority: parseInt(item.getAttribute('data-priority'), 10) || 0
                };
            });

            if (!this.$submenu.is('ul, ol') && this.allItems[0] && this.allItems[0].$item.is('li')) {
                var $menuWrapper = this.$submenu;
                this.$submenu = $(document.createElement('ul'));

                this.$submenu.prop({ className: this.interpolateName(togglePanel.replace(regPoint, '') + '{-}list') });

                rb.rAFQueue(function () {
                    $menuWrapper.append(_this4.$submenu);
                });
            }

            this.mainbarItems = [].concat(this.allItems);

            this.mainbarItems.sort(function (item1, item2) {
                return item2.priority - item1.priority;
            });

            this.mainbarItems.reverse();
            this.panelmenuItems = [];
        };

        ShrinkNav.prototype._getMeasureElement = function _getMeasureElement() {
            var measureElement = this.options.measureElement;


            this.$measureElement = measureElement == 'self' ? this.$element : this.$element.closest(measureElement);
        };

        return ShrinkNav;
    }(rb.Component);

    rb.live.register('shrinknav', ShrinkNav);

    exports.default = ShrinkNav;
});
