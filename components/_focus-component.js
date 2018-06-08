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
        global._focusComponent = mod.exports;
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

    var focusClass = void 0,
        focusSel = void 0;

    var rb = window.rb;

    var generateFocusClasses = function generateFocusClasses() {
        focusClass = ['js', 'rb', 'autofocus'].join(rb.nameSeparator);
        focusSel = '.' + focusClass;
    };

    /**
     * Base Class component to create a _FocusComponent.
     *
     * @alias rb.components._focus_component
     *
     * @extends rb.Component
     *
     * @param element {Element}
     * @param [initialDefaults] {OptionsObject}
     *
     */

    var _FocusComponent = function (_rb$Component) {
        _inherits(_FocusComponent, _rb$Component);

        function _FocusComponent() {
            _classCallCheck(this, _FocusComponent);

            return _possibleConstructorReturn(this, _rb$Component.apply(this, arguments));
        }

        _FocusComponent.prototype.beforeConstruct = function beforeConstruct() {
            _rb$Component.prototype.beforeConstruct.call(this);

            if (!focusClass) {
                generateFocusClasses();
            }
        };

        _FocusComponent.prototype.getFocusElement = function getFocusElement(element) {
            var focusElement = void 0;

            if (element && element !== true) {
                if (element.nodeType == 1) {
                    focusElement = element;
                } else if (typeof element == 'string') {
                    focusElement = rb.elementFromStr(element, this.element)[0];
                }
            } else {
                focusElement = this.options.autofocusSel && this.query(this.options.autofocusSel) || this.query(focusSel);
            }

            if (!focusElement && (element === true || this.element.classList.contains(focusClass))) {
                focusElement = this.element;
            }
            return focusElement;
        };

        _FocusComponent.prototype.setComponentFocus = function setComponentFocus(element, delay) {
            var focusElement = void 0;

            if (typeof element == 'number') {
                delay = element;
                element = null;
            }

            focusElement = !element || element.nodeType != 1 ? this.getFocusElement(element) : element;

            this.storeActiveElement();

            if (focusElement) {
                this.setFocus(focusElement, delay || this.options.focusDelay);
            }
        };

        _FocusComponent.prototype.storeActiveElement = function storeActiveElement() {
            var activeElement = document.activeElement;

            this._activeElement = activeElement && activeElement.nodeName ? activeElement : null;

            return this._activeElement;
        };

        _FocusComponent.prototype.restoreFocus = function restoreFocus(checkInside, delay) {
            var activeElem = this._activeElement;

            if (!activeElem) {
                return;
            }

            if (typeof checkInside == 'number') {
                delay = checkInside;
                checkInside = null;
            }

            this._activeElement = null;
            if (!checkInside || this.element == document.activeElement || this.element.contains(document.activeElement)) {
                this.setFocus(activeElem, delay || this.options.focusDelay);
            }
        };

        _createClass(_FocusComponent, null, [{
            key: 'defaults',
            get: function get() {

                return {
                    focusDelay: 0,
                    autofocusSel: ''
                };
            }
        }]);

        return _FocusComponent;
    }(rb.Component);

    rb.live.register('_focus_component', _FocusComponent);

    exports.default = _FocusComponent;
});
