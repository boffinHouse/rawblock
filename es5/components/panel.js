(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './panelbutton', '../utils/rb$_slide-up-down', '../utils/rb_contains'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./panelbutton'), require('../utils/rb$_slide-up-down'), require('../utils/rb_contains'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.panelbutton, global.rb$_slideUpDown, global.rb_contains);
        global.panel = mod.exports;
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
    var regInputs = /^(?:input|textarea)$/i;

    /**
     * Class component to create a panel. The visibility should be handled using CSS. The component mainly toggles the class `is-open`.
     * @alias rb.components.panel
     * @extends rb.Component
     *
     * @param element
     * @param initialDefaults
     *
     * @fires componentName#change Fires before a panel's `isOpen` state changes. The default behavior can be prevented.
     * @fires componentName#changed Fires after a panel's `isOpen` state changed.
     *
     * @property {Boolean} isOpen
     *
     * @example
     * <button aria-controls="panel-1" data-module="button" type="button" class="js-rb-click">button</button>
     * <div id="panel-1" data-module="panel">
     *    {{panelContent}}
     * </div>
     * @example
     * rb.$('.rb-panel').rbComponent().open();
     * rb.$('.rb-panel').on('panelchanged', function(){
     *      console.log(rb.$(this).rbComponent().isOpen);
     * });
     */

    var Panel = function (_rb$Component) {
        _inherits(Panel, _rb$Component);

        _createClass(Panel, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    animation: '', // || 'slide'
                    duration: 400,
                    easing: '',
                    setFocus: true, // true || false
                    closeOnOutsideClick: false,
                    resetSwitchedOff: true,
                    switchedOff: false,
                    closeOnEsc: false,
                    closeOnFocusout: false,
                    scrollIntoView: false,
                    adjustScroll: false,
                    itemWrapper: '',
                    setDisplay: false,
                    displayTimer: 5000
                };
            }
        }]);

        function Panel(element, initialDefaults) {
            _classCallCheck(this, Panel);

            var _this = _possibleConstructorReturn(this, _rb$Component.call(this, element, initialDefaults));

            _this.isOpen = _this.element.classList.contains(rb.statePrefix + 'open');

            _this.isDefaultOpen = _this.isOpen;

            _this._role = _this.element.getAttribute('role');

            _this._onBodyClick = _this._onBodyClick.bind(_this);
            _this._onOutSideAction = _this._onOutSideAction.bind(_this);

            rb.rAFs(_this, { throttle: true }, '_opened', '_closed', '_switchOn', '_switchOff');
            rb.rAFs(_this, { throttle: true, that: _this }, '_setDisplay');

            _this.setOption('easing', _this.options.easing);

            if (!_this.options.switchedOff) {
                _this.setOption('switchedOff', false);
            } else {
                rb.rAFQueue(function () {
                    element.classList.add(rb.statePrefix + 'switched' + rb.nameSeparator + 'off');
                });
            }
            return _this;
        }

        Panel.prototype._switchOff = function _switchOff() {
            this.element.removeAttribute('aria-hidden');
            this.element.removeAttribute('role');
            this.element.removeAttribute('tabindex');

            if (this.options.resetSwitchedOff) {
                this.isOpen = this.isDefaultOpen;
            }

            if (!this.isDefaultOpen) {
                this.element.classList.remove(rb.statePrefix + 'open');
            }

            this.element.classList.add(rb.statePrefix + 'switched' + rb.nameSeparator + 'off');

            this.$element.css({
                visibility: '',
                height: '',
                overflow: '',
                display: ''
            });
        };

        Panel.prototype._switchOn = function _switchOn() {
            if (this.isOpen) {
                this.element.classList.add(rb.statePrefix + 'open');
            }

            this.element.classList.remove(rb.statePrefix + 'switched' + rb.nameSeparator + 'off');

            this.element.setAttribute('aria-hidden', '' + !this.isOpen);

            this.$element.attr({ 'role': this._role || 'group', tabindex: '-1' });
        };

        Panel.prototype._setDisplay = function _setDisplay() {
            if (!this.isOpen) {
                this.element.style.display = 'none';
            } else if (this.element.style.display == 'none') {
                this.element.style.display = typeof this.options.setDisplay == 'string' ? this.options.setDisplay : '';
            }
            this._displayTimer = null;
        };

        Panel.prototype._shouldTeardown = function _shouldTeardown() {
            if (!this.isOpen && !this.options.closeOnOutsideClick && this.options.closeOnFocusout || !rb.root.contains(this.element)) {
                this.teardownOnOpenEvts();
                return true;
            }
        };

        Panel.prototype._onBodyClick = function _onBodyClick(e) {
            var that;
            if (this.options.closeOnOutsideClick && !this._shouldTeardown() && document.body.contains(e.target) && !rb.contains(this.element, e.target)) {
                that = this;
                this._closeTimer = setTimeout(function () {
                    that.close();
                }, 44);
            }
        };

        Panel.prototype._onOutSideAction = function _onOutSideAction(e) {
            var containers, component;

            if (this.options.closeOnFocusout && (e.type != 'focus' || e.target.tabIndex != -1) && document.body.contains(e.target) && !this._shouldTeardown()) {
                component = this.component(e.target);

                if (component && component.getTarget && component.getTarget() == this.element) {
                    return;
                }

                containers = [this.element];

                if (this.buttonComponent) {
                    containers.push(this.buttonComponent.element);
                }
                if (this.activeButtonComponent) {
                    containers.push(this.activeButtonComponent.element);
                }

                if (!rb.contains(containers, e.target)) {
                    this.close();
                }
            }
        };

        Panel.prototype.setupOnOpenEvts = function setupOnOpenEvts() {
            this.teardownOnOpenEvts();
            if (this.options.closeOnFocusout || this.options.closeOnOutsideClick) {
                document.addEventListener('click', this._onBodyClick, true);
                document.addEventListener('mousedown', this._onOutSideAction, true);
                document.addEventListener('focus', this._onOutSideAction, true);
            }
        };

        Panel.prototype.teardownOnOpenEvts = function teardownOnOpenEvts() {
            clearTimeout(this._closeTimer);
            document.removeEventListener('click', this._onBodyClick, true);
            document.removeEventListener('mousedown', this._onOutSideAction, true);
            document.removeEventListener('focus', this._onOutSideAction, true);
        };

        Panel.prototype.setOption = function setOption(name, value, isSticky) {
            _rb$Component.prototype.setOption.call(this, name, value, isSticky);

            if (name == 'easing' && value && typeof value == 'string') {
                rb.addEasing(value);
            } else if (name == 'switchedOff') {
                if (value) {
                    this._switchOff();
                } else {
                    this._switchOn();
                }
            }
        };

        Panel.prototype.getAnimationData = function getAnimationData() {
            var animationComponent;
            var panel = this;

            var animationData = {
                panel: panel,
                options: {}
            };

            if (panel.options.animation) {
                animationComponent = this;
            } else if (this.options.animation !== false && this.groupComponent) {
                animationComponent = this.groupComponent;
            }

            if (animationComponent) {
                animationData.component = animationComponent;
                animationData.options = {
                    duration: animationComponent.options.duration,
                    easing: animationComponent.options.easing
                };
                animationData.animation = animationComponent.options.animation;
            }

            return animationData;
        };

        Panel.prototype._handleAnimation = function _handleAnimation(e) {
            var $panel;
            var panel = this;
            var animationData = {};

            if (e.defaultPrevented || !e.detail || e.detail.animationPrevented) {
                return animationData;
            }

            animationData = this.getAnimationData();
            $panel = this.$element;

            if (!animationData.component) {
                return animationData;
            }

            if (panel.groupComponent && panel.groupComponent._handleAnimation) {
                panel.groupComponent._handleAnimation(animationData);
            }

            if (animationData.animation == 'slide') {
                $panel.stop();
                if (panel.isOpen) {
                    animationData.options.getHeight = true;
                    animationData.height = $panel.rbSlideDown(animationData.options);
                } else {
                    animationData.height = 0;
                    $panel.rbSlideUp(animationData.options);
                }
            }
            return animationData;
        };

        Panel.prototype.open = function open(options) {
            if (this.isOpen) {
                return false;
            }
            var setFocus;
            var mainOpts = this.options;
            var changeEvent = this.trigger(this._beforeEvtName, options);

            if (!options) {
                options = {};
            }

            if (changeEvent.defaultPrevented) {
                return false;
            }

            setFocus = 'setFocus' in options ? options.setFocus : mainOpts.setFocus;

            this.isOpen = true;

            if (this.groupComponent) {
                this.groupComponent.panelChangeCB(this, 'beforeopen');
            }

            clearTimeout(this._closeTimer);
            if (this._displayTimer) {
                clearTimeout(this._displayTimer);
            }

            options.animationData = this._handleAnimation(changeEvent);

            if (setFocus && !options.focusElement) {
                options.focusElement = this.getFocusElement(setFocus == 'force');
            }

            if (options.focusElement && regInputs.test(options.focusElement.nodeName)) {
                this._opened._rbUnrafedFn.call(this, options);
            } else {
                this._opened(options);
            }
            return true;
        };

        Panel.prototype._getFocusDelay = function _getFocusDelay(actionOptions) {
            var mainOpts = this.options;
            var delay = actionOptions && actionOptions.focusDelay || mainOpts.animation && mainOpts.duration || this.groupComponent && this.groupComponent.options.animation && this.groupComponent.options.duration;

            return delay || mainOpts.focusDelay || 0;
        };

        Panel.prototype._opened = function _opened(options) {
            if (!this.isOpen) {
                return;
            }
            var delay = this._getFocusDelay(options);

            this.element.classList.add(rb.statePrefix + 'open');
            this.element.setAttribute('aria-hidden', 'false');

            if (this.options.setDisplay) {
                this._setDisplay();
            }

            if (this.options.itemWrapper) {
                $(this.element.closest(this.interpolateName(this.options.itemWrapper))).rbToggleState('selected{-}within', true);
            }

            if (this.groupComponent) {
                this.groupComponent.panelChangeCB(this, 'afteropen');
            }

            if (options.focusElement) {
                this.setComponentFocus(options.focusElement, delay);
            } else {
                this.storeActiveElement();
            }
            clearTimeout(this._closeTimer);
            if (this.options.closeOnOutsideClick) {
                this.setupOnOpenEvts();
            }

            this.scrollIntoView(options);

            this.trigger();
        };

        Panel.prototype.toggle = function toggle(options) {
            return this[this.isOpen ? 'close' : 'open'](options);
        };

        Panel.prototype.close = function close(options) {
            if (!this.isOpen) {
                return false;
            }
            var changeEvent = this.trigger(this._beforeEvtName, options);

            if (changeEvent.defaultPrevented) {
                return false;
            }

            this.isOpen = false;

            if (this.groupComponent) {
                this.groupComponent.panelChangeCB(this, 'beforeclose');
            }

            this.adjustScroll();

            this._handleAnimation(changeEvent);

            this._closed(options);
            clearTimeout(this._closeTimer);
            return true;
        };

        Panel.prototype._closed = function _closed(options) {
            if (this.isOpen) {
                return;
            }

            this.element.classList.remove(rb.statePrefix + 'open');
            this.element.setAttribute('aria-hidden', 'true');

            if (this.options.itemWrapper) {
                $(this.element.closest(this.interpolateName(this.options.itemWrapper))).rbToggleState('selected{-}within', false);
            }

            if (this.groupComponent) {
                this.groupComponent.panelChangeCB(this, 'afterclose');
            }

            this.trigger();

            clearTimeout(this._closeTimer);

            if (this.options.closeOnOutsideClick) {
                this.teardownOnOpenEvts();
            }

            if ((!options || options.setFocus !== false) && (this.options.setFocus || options && options.setFocus)) {
                this.restoreFocus(true);
            }

            if (this._displayTimer) {
                clearTimeout();
            }

            if (this.options.setDisplay) {
                this._displayTimer = setTimeout(this._setDisplay, this.options.displayTimer || 5000);
            }
        };

        Panel.prototype._scroll = function _scroll(relPos, animationData) {
            var scrollingElement, scrollTop;

            if (relPos) {
                scrollingElement = rb.getPageScrollingElement();

                scrollTop = Math.max(scrollingElement.scrollTop + relPos, 0);

                if (animationData.animation) {
                    $(scrollingElement).animate({
                        scrollTop: scrollTop
                    }, animationData.options);
                } else {
                    scrollingElement.scrollTop = scrollTop;
                }
            }
        };

        Panel.prototype.scrollIntoView = function scrollIntoView(opts) {
            var activeElement, animationData, box, viewHeight, comparePos, elemHeight, scrollTop;
            var options = this.options;

            if (!options.scrollIntoView) {
                return;
            }

            activeElement = document.activeElement;

            if (!activeElement || !activeElement.compareDocumentPosition || !(comparePos = activeElement.compareDocumentPosition(this.element)) || comparePos != 4 && comparePos != 2) {
                return;
            }

            animationData = opts.animationData;
            box = this.element.getBoundingClientRect();
            viewHeight = rb.root.clientHeight;
            elemHeight = animationData.height || box.height;

            if (comparePos == 4 && box.top + elemHeight > viewHeight) {
                scrollTop = box.top + Math.min(elemHeight, viewHeight - 9) - viewHeight;
            } else if (comparePos == 2 && box.top < 0) {
                scrollTop = box.top;
            }

            if (scrollTop) {
                if (typeof options.scrollIntoView == 'number') {
                    scrollTop += options.scrollIntoView;
                }
                this._scroll(scrollTop, animationData);
            }
        };

        Panel.prototype.adjustScroll = function adjustScroll() {
            var activeElement, animationData, height;
            var options = this.options;
            var adjustScroll = options.adjustScroll;
            if (!adjustScroll) {
                return;
            }

            activeElement = document.activeElement;

            if (!activeElement || !activeElement.compareDocumentPosition || activeElement.compareDocumentPosition(this.element) != 2) {
                return;
            }

            animationData = this.getAnimationData();
            height = this.$element.outerHeight();

            if (typeof adjustScroll == 'number') {
                height -= activeElement.getBoundingClientRect().top - adjustScroll;
            }

            if (height > 0) {
                this._scroll(height * -1, animationData);
            }
        };

        _createClass(Panel, null, [{
            key: 'events',
            get: function get() {
                return {
                    'click .{name}{e}close': function clickNameEClose(e) {
                        this.close();

                        if (e) {
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    },
                    'keydown:keycodes(27)': function keydownKeycodes27(e) {
                        if (this.options.closeOnEsc && !e.defaultPrevented) {
                            this.close();
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }
                };
            }
        }]);

        return Panel;
    }(rb.Component);

    rb.live.register('panel', Panel);

    exports.default = Panel;
});
