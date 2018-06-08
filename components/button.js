(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '../core'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('../core'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.core);
        global.button = mod.exports;
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

    var Button = function (_Component) {
        _inherits(Button, _Component);

        _createClass(Button, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    target: '',
                    type: 'toggle',
                    args: null,
                    switchedOff: false
                };
            }
        }]);

        function Button(element, initialDefaults) {
            _classCallCheck(this, Button);

            var _this = _possibleConstructorReturn(this, _Component.call(this, element, initialDefaults));

            _this._isFakeBtn = !_this.element.matches('input, button');
            _this._resetPreventClick = _this._resetPreventClick.bind(_this);

            _core2.default.rAFs(_this, { throttle: true }, '_switchOff', '_switchOn', '_setAriaControls');

            _this.setOption('args', _this.options.args);

            if (!_this.options.switchedOff) {
                _this.setOption('switchedOff', false);
            }
            return _this;
        }

        Button.prototype._delegateFakeClick = function _delegateFakeClick(e) {
            if (this.options.switchedOff) {
                return;
            }
            if (this._isFakeBtn && (e.keyCode == 32 || e.keyCode == 13)) {
                e.preventDefault();

                if (e.type == 'keyup' && e.keyCode == 32 || e.type == 'keydown' && e.keyCode == 13) {
                    this._onClick(e);
                    this._preventClick = true;
                    setTimeout(this._resetPreventClick, 33);
                }
            }
        };

        Button.prototype._resetPreventClick = function _resetPreventClick() {
            this._preventClick = false;
        };

        Button.prototype._simpleFocus = function _simpleFocus() {
            try {
                if (this.element != document.activeElement) {
                    this.element.focus();
                }
            } catch (e) {} // eslint-disable-line no-empty
        };

        Button.prototype._onClick = function _onClick(e) {
            var args = void 0;

            if (this.options.switchedOff || this._preventClick || this.element.disabled) {
                return;
            }

            var target = this.getTarget();
            var component = target && this.component(target);

            if (!component) {
                return;
            }

            if (e && this.options.preventDefault && e.preventDefault) {
                e.preventDefault();
            }

            if (this.options.type in component) {
                args = this.args;

                this._simpleFocus();

                component.activeButtonComponent = this;
                if (typeof component[this.options.type] == 'function') {
                    component[this.options.type].apply(component, args);
                } else {
                    component[this.options.type] = args;
                }
            }
        };

        Button.prototype.setOption = function setOption(name, value, isSticky) {
            _Component.prototype.setOption.call(this, name, value, isSticky);

            switch (name) {
                case 'target':
                    this._setTarget(value);
                    break;
                case 'args':
                    if (value == null) {
                        value = [];
                    } else if (!Array.isArray(value)) {
                        value = [value];
                    }
                    this.args = value;
                    break;
                case 'switchedOff':
                    if (value) {
                        this._switchOff();
                    } else {
                        this._switchOn();
                    }

                    break;
            }
        };

        Button.prototype._switchOff = function _switchOff() {
            if (this._isFakeBtn) {
                this.element.removeAttribute('role');
                this.element.removeAttribute('tabindex');
            }
        };

        Button.prototype._switchOn = function _switchOn() {
            if (this._isFakeBtn) {
                this.element.setAttribute('role', 'button');
                this.element.setAttribute('tabindex', '0');
            }
        };

        Button.prototype._setAriaControls = function _setAriaControls() {
            if (this.target) {
                this.$element.attr({ 'aria-controls': this.getId(this.target) });
            }
        };

        Button.prototype._setTarget = function _setTarget(element) {
            if (!element) {
                element = this.options.target;
            }

            if (!element && !this.options.target) {
                element = this.element.getAttribute('aria-controls');
            }

            this.target = typeof element == 'string' ? this.getElementsByString(element)[0] : element;

            this.targetAttr = element;

            this._setAriaControls();
        };

        Button.prototype.getTarget = function getTarget() {
            var target = this.options.target || this.element.getAttribute('aria-controls');

            if (!this.target || target != this.targetAttr && target) {
                this._setTarget();
            }

            return this.target;
        };

        _createClass(Button, null, [{
            key: 'events',
            get: function get() {
                return {
                    click: '_onClick',
                    keydown: function keydown(e) {
                        if (this.options.switchedOff) {
                            return;
                        }
                        var target = void 0;

                        var component = this.panelComponent || (target = this.getTarget()) && this.component(target);

                        if (component && e.keyCode == 40 && this.element.getAttribute('aria-haspopup') == 'true') {
                            if (!('isOpen' in component) || !component.isOpen) {
                                this._onClick(e);
                            } else {
                                component.setComponentFocus();
                            }
                            e.preventDefault();
                        } else {
                            this._delegateFakeClick(e);
                        }
                    },

                    keyup: '_delegateFakeClick'
                };
            }
        }]);

        return Button;
    }(_core.Component);

    _core.Component.register('button', Button);

    exports.default = Button;
});
