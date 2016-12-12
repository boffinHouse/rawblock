(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.listbox = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

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

    var rb = window.rb;

    /**
     * Class component to create a ListBox.
     *
     * @name rb.components.listbox
     *
     * @extends rb.Component
     *
     * @param element {Element}
     * @param [initialDefaults] {OptionsObject}
     *
     * @fires listbox#changed
     *
     * @example
     * <div class="js-rb-live" data-module="listbox">
     *      <span class="listbox-item">Item 1</span>
     *      <span class="listbox-item">Item 2</span>
     * </div>
     */

    var Listbox = function (_rb$Component) {
        _inherits(Listbox, _rb$Component);

        _createClass(Listbox, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    focusElement: '',
                    defaultSelected: 0,
                    checkWithSpace: false,
                    disconnected: false
                };
            }
        }]);

        function Listbox(element, initialDefaults) {
            _classCallCheck(this, Listbox);

            var _this = _possibleConstructorReturn(this, _rb$Component.call(this, element, initialDefaults));

            _this.selectedIndex = -1;
            _this.selectedItem = null;

            _this.checkedIndex = -1;
            _this.checkedItem = null;

            _this.isList = Listbox.regList.test(element.nodeName);

            rb.rAFs(_this, { throttle: true }, '_changeSelected', '_changeChecked', 'postRender', 'renderList', '_setFocusElement', '_setInitialMarkup');

            _this._onkeyboardInput = _this._onkeyboardInput.bind(_this);

            _this.setFocusElement();
            _this._getElements();
            return _this;
        }

        Listbox.prototype.setOption = function setOption(name, value, isSticky) {

            _rb$Component.prototype.setOption.call(this, name, value, isSticky);

            switch (name) {
                case 'focusElement':
                    this.setFocusElement();
                    break;
                case 'disconnected':
                    this[value ? '_disconnect' : '_connect']();
                    break;
            }
        };

        Listbox.prototype._setInitialMarkup = function _setInitialMarkup() {
            this.$items.attr({ role: 'option' }).parent().attr({ role: 'listbox' });

            this.$items.filter('.' + rb.statePrefix + 'disabled').attr({ 'aria-disabled': 'true' });

            if (this.checkedItem) {
                this.checkedItem.setAttribute('aria-checked', 'true');
            }

            if (this._isStatic) {
                this.element.style.position = 'relative';
            }
        };

        Listbox.prototype._getElements = function _getElements() {
            this.$items = this.$queryAll('.{name}{e}item');
            this.checkedItem = this.$items.filter('.' + rb.statePrefix + 'checked').get(0) || null;
            this.checkedIndex = this.checkedItem ? this.$items.index(this.checkedItem) : -1;
            this._isStatic = this.$element.css('position') == 'static';
            this._setInitialMarkup();

            if (!this.options.disconnected) {
                this._connect();
            }
        };

        Listbox.prototype._onkeyboardInput = function _onkeyboardInput(e) {
            var prevent;

            if (this.options.disconnected) {
                return;
            }

            if (e.keyCode == 40) {
                prevent = true;
                this.selectNext();
                this.scrollIntoView(this.selectedItem);
            } else if (e.keyCode == 38) {
                prevent = true;
                this.selectPrev();
                this.scrollIntoView(this.selectedItem);
            } else if (this.selectedItem && (e.keyCode == 13 || e.keyCode == 32 && this.options.checkWithSpace)) {
                prevent = true;
                this.checkSelected();
            }

            if (prevent) {
                e.preventDefault();
            }
        };

        Listbox.prototype._disconnect = function _disconnect() {
            this.select(-1);
        };

        Listbox.prototype._connect = function _connect() {
            var activeItem = this.focusElement.getAttribute('aria-activedescendant');
            if (activeItem) {
                activeItem = this.query('#' + activeItem);
            }
            this.select(this.checkedItem || activeItem || this.options.defaultSelected);
            this.scrollIntoView(this.checkedItem || activeItem, true);
        };

        Listbox.prototype.setFocusElement = function setFocusElement() {
            var value = this.options.focusElement;
            var old = this.focusElement;

            this.focusElement = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object' ? value : value && this.getElementsFromString(value)[0] || this.element;

            if (old && old != this.focusElement) {
                old.removeEventListener('keydown', this._onkeyboardInput);
            } else {
                old = null;
            }

            this.focusElement.addEventListener('keydown', this._onkeyboardInput);

            this._setFocusElement(old);
        };

        Listbox.prototype._setFocusElement = function _setFocusElement(old) {
            if (old) {
                old.removeAttribute('aria-activedescendant');
                old.removeAttribute('tabindex');
            }

            if (this.focusElement.tabIndex == -1 && !this.focusElement.getAttribute('tabindex')) {
                this.focusElement.setAttribute('tabindex', '0');
            }
        };

        Listbox.prototype._selectCheck = function _selectCheck(index, type) {
            var item;
            var typeData = Listbox.type[type];

            if (index == -1 || index == null) {
                index = -1;
                item = null;
            } else if (typeof index == 'number') {
                item = this.$items.get(index);
            } else {
                item = index;
                index = this.$items.index(item);
            }

            if (index != this[typeData.index]) {
                this[typeData.index] = index;
                this[typeData.item] = item;
                this[typeData.change]();
            }
        };

        Listbox.prototype.scrollIntoView = function scrollIntoView(item, noAnimate) {
            if (!item || this.element.scrollHeight - 1 <= this.element.offsetHeight) {
                return;
            }
            var moveScroll;
            var listboxTop = this.element.scrollTop;
            var listboxBottom = this.element.offsetHeight + listboxTop;
            var itemTop = item.offsetTop;
            var itemBottom = itemTop + item.offsetHeight;
            var isStartReached = itemTop < listboxTop;
            var isEndReached = itemBottom > listboxBottom;

            if (isStartReached || isEndReached) {
                moveScroll = itemTop;

                this.$element[noAnimate ? 'prop' : 'animate']({
                    scrollTop: moveScroll
                }, {
                    duration: 200
                });
            }
        };

        Listbox.prototype.select = function select(index) {
            this._selectCheck(index, 'select');
        };

        Listbox.prototype._changeSelected = function _changeSelected() {
            this.$items.removeClass(rb.statePrefix + 'selected');

            if (this.selectedItem) {
                this.selectedItem.classList.add(rb.statePrefix + 'selected');
                this.focusElement.setAttribute('aria-activedescendant', this.getId(this.selectedItem));
            }
            this.trigger('selectedchanged');
        };

        Listbox.prototype.getSelectableIndex = function getSelectableIndex(dir) {
            var item;
            var ret = -1;
            var disabledClass = rb.statePrefix + 'disabled';
            var index = this.selectedIndex + dir;

            while (index > -1 && this.$items.length > index) {
                item = this.$items.get(index);
                if (!item.classList.contains(disabledClass) && item.getAttribute('aria-disabled') != 'true') {
                    ret = index;
                    break;
                }
                index += dir;
            }

            return ret;
        };

        Listbox.prototype.selectNext = function selectNext() {
            var index = this.getSelectableIndex(1);

            if (index > -1) {
                this.select(index);
            }
        };

        Listbox.prototype.selectPrev = function selectPrev() {
            var index = this.getSelectableIndex(-1);

            if (index > -1) {
                this.select(index);
            }
        };

        Listbox.prototype._changeChecked = function _changeChecked() {
            this.$items.filter('.' + rb.statePrefix + 'checked').rbChangeState('checked').removeAttr('aria-checked');

            if (this.checkedItem) {
                this.checkedItem.classList.add(rb.statePrefix + 'checked');
                this.checkedItem.setAttribute('aria-checked', 'true');
            }
            this.trigger();
        };

        Listbox.prototype.check = function check(index) {
            this._selectCheck(index, 'check');
        };

        Listbox.prototype.checkSelected = function checkSelected() {
            if (this.selectedItem) {
                this.check(this.selectedItem);
            }
        };

        Listbox.prototype.postRender = function postRender() {};

        Listbox.prototype.renderList = function renderList() {};

        _createClass(Listbox, null, [{
            key: 'events',
            get: function get() {
                return {
                    'mousedown:closest(.{name}{e}item)': function mousedownClosestNameEItem(e) {
                        this.select(e.delegatedTarget);
                    },
                    'click .{name}{e}item:not([aria-disabled="true"])': function clickNameEItemNotAriaDisabledTrue(e) {
                        this.select(e.delegatedTarget);
                        this.check(e.delegatedTarget);
                    }
                };
            }
        }]);

        return Listbox;
    }(rb.Component);

    Object.assign(Listbox, {
        regList: /^(?:ol|ul)$/i,
        type: {
            select: {
                index: 'selectedIndex',
                item: 'selectedItem',
                change: '_changeSelected'
            },
            check: {
                index: 'checkedIndex',
                item: 'checkedItem',
                change: '_changeChecked'
            }
        }
    });

    rb.live.register('listbox', Listbox);

    exports.default = Listbox;
});
