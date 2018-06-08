(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '../core', './button'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('../core'), require('./button'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.core, global.button);
        global.panelbutton = mod.exports;
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

    var PanelButton = function (_rb$components$button) {
        _inherits(PanelButton, _rb$components$button);

        _createClass(PanelButton, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    openTitle: '',
                    closedTitle: ''
                };
            }
        }]);

        function PanelButton(element, initialOpts) {
            _classCallCheck(this, PanelButton);

            var _this = _possibleConstructorReturn(this, _rb$components$button.call(this, element, initialOpts));

            _this.rAFs({ that: _this, throttle: true }, 'updatePanelButtonState');
            return _this;
        }

        PanelButton.prototype.updatePanelButtonState = function updatePanelButtonState() {
            var options = this.options;
            var isOpen = this.panelComponent.isOpen;
            var disable = !!(isOpen && this.panelComponent.groupComponent && this.panelComponent.groupComponent.options.toggle === false);

            this.element.setAttribute('aria-expanded', '' + isOpen);

            this.element.disabled = disable;

            if (options.closedTitle && options.openTitle) {
                this.element.title = options[isOpen ? 'openTitle' : 'closedTitle'];
            }

            if (this._isFakeBtn) {
                this.element.setAttribute('aria-disabled', disable);
                this.element.setAttribute('tabindex', disable ? -1 : 0);
            }
        };

        PanelButton.prototype._switchOff = function _switchOff() {
            _rb$components$button.prototype._switchOff.call(this);

            this.element.removeAttribute('aria-expanded');

            if (this._isFakeBtn) {
                this.element.removeAttribute('role');
                this.element.removeAttribute('tabindex');
                this.element.removeAttribute('aria-disabled');
            }
        };

        PanelButton.prototype._switchOn = function _switchOn() {
            _rb$components$button.prototype._switchOn.call(this);
            if (!this.panelComponent) {
                this.associatePanel();
            } else {
                this.updatePanelButtonState();
            }
        };

        PanelButton.prototype._setTarget = function _setTarget(value) {
            var ret = _rb$components$button.prototype._setTarget.call(this, value);
            if (this.target) {
                this.associatePanel();
            }
            return ret;
        };

        PanelButton.prototype.associatePanel = function associatePanel() {
            var panelComponent;
            var panel = this.getTarget();

            if (!panel || !(panelComponent = this.component(panel)) || !('isOpen' in panelComponent) || this.panelComponent == panelComponent) {
                return;
            }

            if (this.panelComponent) {
                if (this.panelComponent.buttonComponent == this) {
                    this.panelComponent.buttonComponent = null;
                }
                this.panelComponent.$element.off(this.panelComponent._evtName, this.updatePanelButtonState);
            }

            this.panelComponent = panelComponent;
            panelComponent.buttonComponent = this;
            panelComponent.$element.on(this.panelComponent._evtName, this.updatePanelButtonState);

            this.updatePanelButtonState();
        };

        return PanelButton;
    }(_core2.default.components.button);

    _core.Component.register('panelbutton', PanelButton);

    exports.default = PanelButton;
});
