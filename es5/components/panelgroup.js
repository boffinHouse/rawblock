(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './panelbutton', './panel', '../utils/rb_contains'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./panelbutton'), require('./panel'), require('../utils/rb_contains'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.panelbutton, global.panel, global.rb_contains);
        global.panelgroup = mod.exports;
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

    var rb = window.rb;
    var $ = rb.$;
    var live = rb.live;
    var componentExpando = live.componentExpando;
    var components = rb.components;

    var cleanupCSS = function cleanupCSS() {
        var css = { display: '' };

        if (!this.style.height.startsWith('0')) {
            css.height = '';
            css.overflow = '';
        }

        $(this).css(css);
    };

    /**
     * Class component to create a tab-like or an accordion-like component.
     *
     * @alias rb.components.panelgroup
     * @extends rb.Component
     *
     * @param element {Element}
     *
     * @fires panelgroup#changed Fires after the `selectedIndexes`/`selectedItems` changes. Note the panel#change and panel#changed events are also fired on the panel elements.
     *
     * @prop {Number[]} selectedIndexes The index(es) of the open panel(s)
     * @prop {Element[]} selectedItems The dom element(s) of the open panel(s)
     *
     * @example
     * <div class="rb-tabs js-rb-click" data-module="panelgroup" data-panelgroup-toggle="false">
     *      <button type="button" class="panelgroup-ctrl-btn" data-type="prev">&lt;</button>
     *      <button type="button" class="panelgroup-ctrl-btn" data-type="next">&gt;</button>
     *
     *      <button type="button" class="panelgroup-btn">1</button>
     *      <div class="panelgroup-panel">
     *          {{panelContent}}
     *      </div>
     *
     *      <button type="button" class="panelgroup-btn">2</button>
     *      <div class="panelgroup-panel">
     *          {{panelContent}}
     *      </div>
     * </div>
     * @example
     * rb.$('.rb-tabs').on('panelgroupchanged', function(){
    			 *      console.log(rb.$(this).rbComponent().selectedIndexes);
    			 * });
     *
     * rb.$('.rb-tabs').rbComponent().next();
     */

    var PanelGroup = function (_rb$Component) {
        _inherits(PanelGroup, _rb$Component);

        _createClass(PanelGroup, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    multiple: false,
                    toggle: true,
                    animation: '', // 'adaptHeight' || 'slide'
                    easing: '',
                    duration: 400,
                    closeOnFocusout: false,
                    selectedIndex: -1,
                    adjustScroll: false,
                    scrollIntoView: false,
                    setFocus: true,
                    switchedOff: false,
                    resetSwitchedOff: true,
                    panelName: '{name}{e}panel',
                    panelSel: 'find(.{name}{e}panel)',
                    btnSel: 'find(.{name}{e}btn)',
                    groupBtnSel: 'find(.{name}{e}ctrl{-}btn)',
                    panelWrapperSel: 'find(.{name}{e}panel{-}wrapper):0',
                    btnWrapperSel: 'find(.{name}{e}btn{-}wrapper):0',
                    itemWrapper: '',
                    setDisplay: false
                };
            }
        }]);

        function PanelGroup(element, initialDefaults) {
            _classCallCheck(this, PanelGroup);

            var _this = _possibleConstructorReturn(this, _rb$Component.call(this, element, initialDefaults));

            if (_this.options.multiple && !_this.options.toggle) {
                _this.options.toggle = true;
            }

            _this.$element = $(element);

            _this.selectedIndexes = [];
            _this.selectedItems = [];
            _this.closingItems = [];
            _this.openingItems = [];

            rb.rAFs(_this, 'setSelectedState', 'setSwitchedOffClass');

            _this._onOutSideInteraction = _this._onOutSideInteraction.bind(_this);

            _this.setOption('easing', _this.options.easing);

            if (!_this.options.switchedOff) {
                _this.setOption('switchedOff', false);
            } else {
                _this.setSwitchedOffClass();
            }
            return _this;
        }

        PanelGroup.prototype.setSwitchedOffClass = function setSwitchedOffClass() {
            this.element.classList[this.options.switchedOff ? 'add' : 'remove'](rb.statePrefix + 'switched' + rb.nameSeparator + 'off');
        };

        PanelGroup.prototype._handleAnimation = function _handleAnimation(animationData) {
            if (animationData.animation == 'adaptHeight') {
                if (animationData.panel.isOpen) {
                    this.animateWrapper(animationData.panel.element);
                } else if (!this._closedByOpen) {
                    this.animateWrapper();
                }
            }
        };

        PanelGroup.prototype.animateWrapper = function animateWrapper(openedPanel) {
            var end = void 0;

            var that = this;
            var panels = this.$panels.get();
            var panelWrapper = this.$panelWrapper.get(0);
            var nextIndex = openedPanel ? panels.indexOf(openedPanel) : 0;
            var closingPanels = [];

            var curIndex = -1;

            var start = panelWrapper.offsetHeight;

            this.$panelWrapper.stop();

            panelWrapper.style.height = 'auto';

            this.closingItems.forEach(function (panel) {
                panel.style.display = 'none';
                curIndex = panels.indexOf(panel);
                closingPanels.push(panel);
            });

            if (openedPanel) {
                openedPanel.style.display = 'block';
                openedPanel.style.position = 'relative';
            }

            end = panelWrapper.offsetHeight;

            this.closingItems.forEach(function (panel) {
                panel.style.display = '';
            });

            if (openedPanel) {
                openedPanel.style.display = '';
                openedPanel.style.position = '';
            }

            $(closingPanels).addClass(rb.statePrefix + 'closing');

            this.$panelWrapper.attr({ 'data-direction': nextIndex > curIndex ? 'up' : 'down' }).css({
                overflow: 'hidden',
                height: start + 'px'
            }).animate({ height: end }, {
                duration: this.options.duration,
                easing: this.options.easing,
                always: function always() {
                    that.$panels.removeClass(rb.statePrefix + 'closing');
                    that.$panelWrapper.removeClass(rb.statePrefix + 'fx').attr({ 'data-direction': '' });
                    cleanupCSS.call(this);
                }
            }).addClass(rb.statePrefix + 'fx');
        };

        PanelGroup.prototype.setSelectedState = function setSelectedState() {
            this.element.classList.toggle(rb.statePrefix + 'selected' + rb.nameSeparator + 'within', !!this.selectedIndexes.length);
        };

        PanelGroup.prototype._updatePanelInformation = function _updatePanelInformation() {
            var that = this;
            this.selectedIndexes.length = 0;
            this.selectedItems.length = 0;

            this.$panels.each(function (i) {
                if (this[componentExpando].isOpen) {
                    that.selectedIndexes.push(i);
                    that.selectedItems.push(this);
                }
            });

            if (this.options.closeOnFocusout) {
                this._addRemoveFocusOut();
            }
            this.setSelectedState();
        };

        PanelGroup.prototype._addRemoveFocusOut = function _addRemoveFocusOut() {
            var shouldInstall = this.options.closeOnFocusout && this.selectedItems.length;
            var touchEvts = { passive: true, capture: true };

            document.removeEventListener('focus', this._onOutSideInteraction, true);
            document.removeEventListener('mousedown', this._onOutSideInteraction, touchEvts);
            document.removeEventListener('touchstart', this._onOutSideInteraction, touchEvts);

            if (shouldInstall) {
                document.addEventListener('focus', this._onOutSideInteraction, true);
                document.addEventListener('mousedown', this._onOutSideInteraction, touchEvts);
                document.addEventListener('touchstart', this._onOutSideInteraction, touchEvts);
            }
        };

        PanelGroup.prototype._onOutSideInteraction = function _onOutSideInteraction(e) {
            var target = e.type == 'touchstart' ? (e.changedTouches || e.touches || [e])[0].target : e.target;

            if (target && (e.type != 'focus' || target.tabIndex != -1) && !rb.contains(this.element, target) && document.body.contains(target)) {
                this.closeAll();
            }
        };

        PanelGroup.prototype._getElements = function _getElements() {
            var panels = void 0;
            var that = this;
            var options = this.options;

            var buttonWrapper = this.getElementsFromString(options.btnWrapperSel)[0];
            var itemWrapper = this.interpolateName(this.options.itemWrapper || '');

            var panelName = this.interpolateName(this.options.panelName);
            var jsPanelName = this.interpolateName(this.options.panelName, true);

            this.$panelWrapper = $(this.getElementsFromString(options.panelWrapperSel));

            this.$panels = $(this.getElementsFromString(options.panelSel, this.$panelWrapper.get(0))).each(function () {
                var panel = live.create(this, rb.components.panel, {
                    jsName: jsPanelName,
                    name: panelName,
                    resetSwitchedOff: options.resetSwitchedOff,
                    setFocus: options.setFocus,
                    itemWrapper: itemWrapper,
                    closeOnEsc: options.closeOnEsc,
                    adjustScroll: options.adjustScroll,
                    scrollIntoView: options.scrollIntoView,
                    setDisplay: options.setDisplay
                });

                panel.group = that.element;
                panel.groupComponent = that;
            });

            panels = this.$panels;

            this.$buttons = $(this.getElementsFromString(options.btnSel, buttonWrapper)).each(function (index) {
                var btn = live.create(this, components.panelbutton, {
                    type: options.toggle ? 'toggle' : 'open',
                    preventDefault: options.preventDefault
                });
                var panel = panels.get(index);

                if (panel) {
                    btn._setTarget(panels.get(index));
                }
            });

            this.$groupButtons = $(this.getElementsFromString(options.groupBtnSel)).each(function () {
                live.create(this, components.panelgroupbutton, {
                    preventDefault: options.preventDefault,
                    target: that.element
                });
            });
        };

        PanelGroup.prototype.closeAll = function closeAll(except) {
            if (this.selectedItems.length) {
                this.$panels.get().forEach(function (panel, i) {
                    var component = live.getComponent(panel);
                    if (component && component != except && panel != except && i !== except) {
                        component.close();
                    }
                });
            }
        };

        PanelGroup.prototype.openAll = function openAll(except) {
            this.$panels.get().forEach(function (panel, i) {
                var component = live.getComponent(panel);
                if (component && component != except && panel != except && i !== except) {
                    component.open();
                }
            });
        };

        PanelGroup.prototype.toggleAll = function toggleAll() {
            if (this.selectedItems.length) {
                this.closeAll();
            } else {
                this.openAll();
            }
        };

        PanelGroup.prototype._triggerOnce = function _triggerOnce() {
            var _this2 = this;

            if (!this._isTriggering) {
                (function () {
                    var that = _this2;
                    _this2._isTriggering = true;
                    setTimeout(function () {
                        that._isTriggering = false;
                        that.trigger();
                    });
                })();
            }
        };

        PanelGroup.prototype.panelChangeCB = function panelChangeCB(panelComponent, action) {
            var options = this.options;

            if (action.startsWith('before')) {

                if (action == 'beforeopen' && !options.multiple && this.selectedItems.length) {
                    this._closedByOpen = true;
                    this.closeAll(panelComponent);
                    this._closedByOpen = false;
                }

                this[action == 'beforeopen' ? 'openingItems' : 'closingItems'].push(panelComponent.element);

                this._updatePanelInformation();
            } else if (action.startsWith('after')) {

                if (this.openingItems.length) {
                    this.openingItems.length = 0;
                }
                if (this.closingItems.length) {
                    this.closingItems.length = 0;
                }

                this._triggerOnce();
            }
        };

        PanelGroup.prototype.next = function next(options) {
            var selectedIndex = this.selectedIndexes[0];

            selectedIndex = selectedIndex == null ? 0 : selectedIndex + 1;

            if (selectedIndex >= this.$panels.get().length) {
                selectedIndex = 0;
            }

            this.selectIndex(selectedIndex, options);
        };

        PanelGroup.prototype.prev = function prev(options) {
            var selectedIndex = this.selectedIndexes[0];

            selectedIndex = selectedIndex == null ? 0 : selectedIndex - 1;

            if (selectedIndex < 0) {
                selectedIndex = this.$panels.get().length - 1;
            }

            this.selectIndex(selectedIndex, options);
        };

        PanelGroup.prototype.getComponentByIndexOrDOM = function getComponentByIndexOrDOM(index) {

            if (index == null) {
                index = 0;
            }

            var panel = typeof index == 'number' ? this.$panels.get(index) : index;

            if (!panel || !panel[componentExpando]) {
                return false;
            }
            return panel[componentExpando];
        };

        PanelGroup.prototype.selectIndex = function selectIndex(index, options) {
            var component = this.getComponentByIndexOrDOM(index);
            return component && component.open(options);
        };

        PanelGroup.prototype.deselectIndex = function deselectIndex(index, options) {
            var component = this.getComponentByIndexOrDOM(index);
            return component && component.close(options);
        };

        PanelGroup.prototype._switchOff = function _switchOff() {
            if (this.$panels && this.$buttons) {
                this.setChildOption(this.$groupButtons, 'switchedOff', true);
                this.setChildOption(this.$buttons, 'switchedOff', true);
                this.setChildOption(this.$panels, 'switchedOff', true);
            }
            this.setSwitchedOffClass();
        };

        PanelGroup.prototype._switchOn = function _switchOn() {
            if (!this.$panelWrapper || !this.$panels.length) {
                this._getElements();
            } else {
                this.setChildOption(this.$panels, 'switchedOff', false);
                this.setChildOption(this.$groupButtons, 'switchedOff', false);
                this.setChildOption(this.$buttons, 'switchedOff', false);
            }

            this._updatePanelInformation();
            this.setSwitchedOffClass();

            if (!this.selectedIndexes.length) {
                this.selectIndex(this.options.selectedIndex, { animationPrevented: true, setFocus: false });
            }
        };

        PanelGroup.prototype.setOption = function setOption(name, value, isSticky) {
            var _this3 = this;

            if (name == 'multiple' && value && !this.options.toggle) {
                this.setOption('toggle', true, isSticky);
            } else if (name == 'toggle' && value != this.options.toggle) {
                this.setChildOption(this.$buttons, 'type', value ? 'toggle' : 'open', isSticky);
            } else if (name == 'easing' && value && typeof value == 'string') {
                rb.addEasing(value);
            } else if (name == 'setFocus' || name == 'resetSwitchedOff' || name == 'closeOnEsc' || name == 'adjustScroll' || name == 'scrollIntoView' || name == 'setDisplay') {
                this.setChildOption(this.$panels, name, value);
            } else if (name == 'closeOnFocusout') {
                this._addRemoveFocusOut();
            } else if (name == 'switchedOff') {
                if (value) {
                    this._switchOff();
                } else {
                    this._switchOn();
                }
            } else if (name == 'preventDefault') {
                this.setChildOption(this.$groupButtons, name, value, isSticky);
                this.setChildOption(this.$buttons, name, value, isSticky);
            } else if (name == 'itemWrapper') {
                value = this.interpolateName(value);
                this.setChildOption(this.$panels, name, value, isSticky);
            }

            _rb$Component.prototype.setOption.call(this, name, value, isSticky);

            if ((name == 'toggle' || name == 'multiple') && this.options.multiple && !this.options.toggle) {
                (function () {
                    var that = _this3;
                    setTimeout(function () {
                        if (that.options.multiple && !that.options.toggle) {
                            that.setOption('toggle', true, isSticky);
                        }
                    });
                })();
            }
        };

        return PanelGroup;
    }(rb.Component);

    rb.live.register('panelgroup', PanelGroup);

    exports.default = PanelGroup;

    var PanelGroupButton = function (_components$button) {
        _inherits(PanelGroupButton, _components$button);

        function PanelGroupButton() {
            _classCallCheck(this, PanelGroupButton);

            return _possibleConstructorReturn(this, _components$button.apply(this, arguments));
        }

        return PanelGroupButton;
    }(components.button);

    live.register('panelgroupbutton', PanelGroupButton);

    /**
     * Class component to create a tab component. This component simply just changes some default options of the [panelgroup component]{@link rb.components.panelgroup}.
     * @alias rb.components.tabs
     * @extends rb.components.panelgroup
     *
     * @param element
     * @param initialDefaults
     *
     * @example
     * <div class="rb-tabs js-rb-click" data-module="tabs">
     *      <button type="button" class="tabs-btn" aria-expanded="true">1</button>
     *      <button type="button" class="tabs-btn">2</button>
     *
     *      <button type="button" class="tabs-ctrl-btn" data-type="prev">&lt;</button>
     *      <button type="button" class="tabs-ctrl-btn" data-type="next">&gt;</button>
     *
     *      <div class="tabs-panel is-open">
     *          {{panelContent}}
     *      </div>
     *      <div class="tabs-panel">
     *          {{panelContent}}
     *      </div>
     * </div>
     * @example
     * rb.$('.rb-tabs').on('tabschanged', function(){
     *      console.log(rb.$(this).rbComponent().selectedIndexes);
     * });
     *
     * rb.$('.rb-tabs').rbComponent().next();
     */

    var Tabs = function (_components$panelgrou) {
        _inherits(Tabs, _components$panelgrou);

        function Tabs() {
            _classCallCheck(this, Tabs);

            return _possibleConstructorReturn(this, _components$panelgrou.apply(this, arguments));
        }

        _createClass(Tabs, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    selectedIndex: 0,
                    toggle: false,
                    animation: 'adaptHeight'
                };
            }
        }]);

        return Tabs;
    }(components.panelgroup);

    live.register('tabs', Tabs);

    /**
     * Class component to create a accordion component. This component simply just changes some default options of the [panelgroup component]{@link rb.components.panelgroup}.
     * @alias rb.components.accordion
     * @extends rb.components.panelgroup
     *
     *
     * @example
     * <div class="rb-accordion js-rb-click" data-module="accordion">
     *      <button type="button" class="accordion-btn" aria-expanded="true">1</button>
     *      <div class="accordion-panel is-open">
     *          {{panelContent}}
     *      </div>
     *
     *      <button type="button" class="accordion-btn">2</button>
     *      <div class="accordion-panel">
     *          {{panelContent}}
     *      </div>
     * </div>
     * @example
     * rb.$('.rb-tabs').on('accordionchanged', function(){
     *      console.log(rb.$(this).rbComponent().selectedIndexes);
     * });
     */

    var Accordion = function (_components$panelgrou2) {
        _inherits(Accordion, _components$panelgrou2);

        function Accordion() {
            _classCallCheck(this, Accordion);

            return _possibleConstructorReturn(this, _components$panelgrou2.apply(this, arguments));
        }

        _createClass(Accordion, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    selectedIndex: 0,
                    toggle: false,
                    animation: 'slide',
                    adjustScroll: 10,
                    itemWrapper: '.{name}{e}item'
                };
            }
        }]);

        return Accordion;
    }(components.panelgroup);

    live.register('accordion', Accordion);
});
