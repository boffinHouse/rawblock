(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '../core', '../utils/scrollbarwidth', './_focus-component'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('../core'), require('../utils/scrollbarwidth'), require('./_focus-component'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.core, global.scrollbarwidth, global._focusComponent);
        global.dialog = mod.exports;
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

    var $ = _core.Component.$;
    var regInputs = /^(?:input|textarea)$/i;

    /**
     * Class component to create a modal dialog with a backdrop.
     *
     * @alias rb.components.dialog
     *
     * @extends rb.components._focus_component
     *
     * @param element {Element}
     * @param [initialDefaults] {OptionsObject}
     *
     * @fires dialog#change Fires before a dialog's `isOpen` state changes; The default behavior can be prevented.
     * @fires dialog#changed Fires after a dialog's `isOpen` state changed;
     *
     * @example
     * <button aria-controls="dialog-1" data-module="button" type="button" class="js-rb-click">button</button>
     * <div id="dialog-1" class="rb-dialog" data-module="dialog">
     *     <div class="dialog-content">
     *      {{dialogContent}}
     *    </div>
     *    <button type="button" class="dialog-close">close</button>
     * </div>
     * @example
     * rb.$('.rb-dialog').rbComponent().open();
     * rb.$('.rb-dialog').on('dialogchanged', function(){
     *      console.log(rb.$(this).rbComponent().isOpen);
     * });
     */

    var Dialog = function (_rb$components$_focus) {
        _inherits(Dialog, _rb$components$_focus);

        _createClass(Dialog, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    open: false,
                    closeOnEsc: true,
                    closeOnBackdropClick: true,
                    appendToBody: true,
                    contentId: '',
                    backdropClass: '',
                    setDisplay: true,
                    scrollPadding: 'paddingRight',
                    trapKeyboard: true,
                    setFocus: 'force',
                    contentUrl: '',
                    xhrOptions: null
                };
            }
        }, {
            key: 'events',
            get: function get() {
                return {
                    'click:closest(.{name}{e}close)': function clickClosestNameEClose(e) {
                        this.close();
                        e.preventDefault();
                        e.stopPropagation();
                    }
                };
            }
        }]);

        function Dialog(element, initialDefaults) {
            _classCallCheck(this, Dialog);

            var _this = _possibleConstructorReturn(this, _rb$components$_focus.call(this, element, initialDefaults));

            /**
             * @name rb.components.dialog.prototype.isOpen
             * @type {boolean}
             */
            _this.isOpen = false;

            _this.$backdrop = $(document.createElement('div')).addClass(_this.name + _core2.default.elementSeparator + 'backdrop');

            _this.contentElement = _this.query('.{name}{e}content');

            _this.rAFs({ that: _this, throttle: true }, '_setup', '_addContent', '_setDisplay');

            _this.rAFs({ throttle: true }, '_open', '_close');

            if (_this.options.open) {
                _this._setup();
            } else {
                setTimeout(_this._setup, 99 + 999 * Math.random());
            }
            return _this;
        }

        Dialog.prototype._setup = function _setup() {
            if (this.isReady || !this.element.parentNode) {
                return;
            }

            var backdrop = void 0,
                isWrapped = void 0;

            var backdropDocument = this.element.parentNode;
            var backdropDocumentName = this.name + _core2.default.elementSeparator + 'backdrop' + _core2.default.nameSeparator + 'document';

            this.trapKeyboardElemBefore = $(document.createElement('span')).attr({
                'class': this.name + 'keyboardtrap',
                'tabindex': this.options.trapKeyboard ? 0 : -1
            }).get(0);

            this.trapKeyboardElemAfter = this.trapKeyboardElemBefore.cloneNode();

            this.isReady = true;

            if (!backdropDocument || !backdropDocument.classList.contains(backdropDocumentName)) {
                backdropDocument = document.createElement('div');
                backdropDocument.className = backdropDocumentName;
                this.$backdrop.append(backdropDocument);
            } else if (backdropDocument && (backdrop = backdropDocument.parentNode) && backdrop.classList.contains(this.name + _core2.default.elementSeparator + 'backdrop')) {
                this.$backdrop = $(backdrop);
                isWrapped = true;
            }

            this.backdropDocument = backdropDocument;

            $(this.backdropDocument).before(this.trapKeyboardElemBefore).after(this.trapKeyboardElemAfter);

            if (this.options.backdropClass) {
                this.$backdrop.addClass(this.options.backdropClass);
            }

            if (this.options.appendToBody) {
                document.body.appendChild(this.$backdrop.get(0));
            } else if (!isWrapped) {
                this.$element.before(this.$backdrop.get(0));
            }

            if (!isWrapped) {
                backdropDocument.appendChild(this.element);
            }

            if (!this.element.getAttribute('tabindex')) {
                this.element.setAttribute('tabindex', '-1');
            }
            if (!this.element.getAttribute('role')) {
                this.element.setAttribute('role', 'group');
            }

            this._setUpEvents();

            if (this.options.open) {
                this.open();
            } else if (this.options.setDisplay) {
                this.$backdrop.css({ display: 'none' });
            }
        };

        Dialog.prototype._open = function _open(options) {
            var _this2 = this;

            var content = void 0;

            if (this.contentElement && options && options.contentId && this._curContentId != options.contentId && (content = document.getElementById(options.contentId))) {
                this._curContentId = options.contentId;
                this.contentElement.innerHTML = content.innerHTML;
            }

            if (this._xhr) {
                this.contentElement.innerHTML = '';
                this.$backdrop.addClass(_core2.default.statePrefix + 'loading');
            }

            this.$backdrop.css({ display: '' });
            this.$backdrop.rbToggleState('open', true);

            _core2.default.$root.rbToggleState('open{-}' + this.name + '{-}within', true).rbToggleState('open{-}dialog{-}within', true);

            if (this._setScrollPadding && this.options.scrollPadding) {
                document.body.style[this.options.scrollPadding] = this._setScrollPadding + 'px';
            }

            if (options.focusElement) {
                this.setComponentFocus(options.focusElement);
            } else {
                this.storeActiveElement();
            }

            _core2.default.rAFQueue(function () {
                _this2.$backdrop.rbToggleState('opened', _this2.isOpen);
            });

            this.trigger(options);
        };

        Dialog.prototype.open = function open(options) {
            var scrollbarWidth = void 0;

            var mainOpts = this.options;

            if (this.isOpen || this.trigger(this._beforeEvtName, options).defaultPrevented) {
                return false;
            }

            if (!this.isReady) {
                this._setup();
            }

            this.isOpen = true;

            if (!options) {
                options = {};
            }

            if (_typeof(options.focusElement) != 'object' && (options.focusElement || mainOpts.setFocus)) {
                options.focusElement = this.getFocusElement(options.focusElement || mainOpts.setFocus == 'force');
            }

            if (options.contentUrl) {
                this._xhr = _core2.default.fetch(options.contentUrl, 'xhrOptions' in options ? options.xhrOptions : mainOpts.xhrOptions).then(this._addContent);
            }

            if (this.options.setDisplay && this._displayTimer) {
                clearTimeout(this._displayTimer);
                this._displayTimer = null;
            }

            this._setScrollPadding = this.options.scrollPadding && _core2.default.root.clientHeight + 1 < _core2.default.root.scrollHeight && (scrollbarWidth = _core2.default.scrollbarWidth) && parseFloat(_core2.default.getStyles(document.body)[this.options.scrollPadding]) + scrollbarWidth;

            if (this._setScrollPadding) {
                this._oldPaddingValue = document.body.style[this.options.scrollPadding];
            }

            if (!this.options.setDisplay && options.focusElement && regInputs.test(options.focusElement.nodeName)) {
                this._open._rbUnrafedFn.call(this, options);
            } else {
                this._open(options);
            }
            return true;
        };

        Dialog.prototype._close = function _close(options) {
            this.restoreFocus(true);

            if (this._setScrollPadding && this._oldPaddingValue != null) {
                document.body.style[this.options.scrollPadding] = this._oldPaddingValue;
                this._setScrollPadding = 0;
                this._oldPaddingValue = null;
            }

            this.$backdrop.rbToggleState('open', false).rbToggleState('opened', this.isOpen);

            _core2.default.$root.rbToggleState('open{-}' + this.name + '{-}within', false).rbToggleState('open{-}dialog{-}within', false);

            if (this.options.setDisplay) {
                clearTimeout(this._displayTimer);
                this._displayTimer = setTimeout(this._setDisplay, 5000);
            }
            this.trigger(options);
        };

        Dialog.prototype.close = function close(options) {
            if (!this.isOpen || this.trigger(this._beforeEvtName, options).defaultPrevented) {
                return false;
            }
            this.isOpen = false;
            this._xhr = null;

            this._close(options);
            return true;
        };

        Dialog.prototype.toggle = function toggle(options) {
            this[this.isOpen ? 'close' : 'open'](options);
        };

        Dialog.prototype._addContent = function _addContent(data) {
            if (this._xhr && this.contentElement) {
                this.contentElement.innerHTML = data.data;
            }
            this.$backdrop.removeClass(_core2.default.statePrefix + 'loading');
            this._xhr = null;
        };

        Dialog.prototype._setDisplay = function _setDisplay() {
            this.$backdrop.css({ display: this.isOpen ? '' : 'none' });
            this._displayTimer = null;
        };

        Dialog.prototype._setUpEvents = function _setUpEvents() {
            var _this3 = this;

            var options = this.options;

            this.$backdrop.on('click', function (e) {
                if (options.closeOnBackdropClick && (e.target == e.currentTarget || e.target == _this3.backdropDocument)) {
                    _this3.close();
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            this.$backdrop.on('keydown', function (e) {
                if (e.keyCode == 27 && options.closeOnEsc && !e.defaultPrevented) {
                    _this3.close();
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            this.trapKeyboardElemBefore.addEventListener('focus', function (e) {
                if (options.trapKeyboard) {
                    var focusElem = _this3.queryAll('.{name}{e}close');

                    e.preventDefault();
                    try {
                        focusElem[focusElem.length - 1].focus();
                    } catch (er) {
                        _core2.default.logInfo('Focus error', er);
                    }
                }
            }, true);

            this.trapKeyboardElemAfter.addEventListener('focus', function (e) {

                if (options.trapKeyboard) {
                    e.preventDefault();
                    try {
                        _this3.element.focus();
                    } catch (er) {
                        _core2.default.logInfo('Focus error', er);
                    }
                }
            }, true);
        };

        return Dialog;
    }(_core2.default.components._focus_component);

    _core2.default.ready.then(function () {
        _core2.default.click.add('dialog', function (element, event, attr) {
            var dialog = void 0;
            var opts = _core2.default.jsonParse(attr);

            if (typeof opts == 'string') {
                opts = { id: opts };
            }

            dialog = document.getElementById(opts.id);

            opts.event = event;

            if (dialog && (dialog = _core2.default.getComponent(dialog))) {
                dialog.open(opts);
                event.preventDefault();
                opts.event = event;
            }
        });
    });

    _core.Component.register('dialog', Dialog);

    exports.default = Dialog;
});
