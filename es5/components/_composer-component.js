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
        global._composerComponent = mod.exports;
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
    var childOptionExpando = rb.Symbol('childOptionExpando');

    /**
     * Base Class component to create a _ComposerComponent.
     *
     * @alias rb.components._composer_component
     *
     * @extends rb.Component
     *
     * @param element {Element}
     * @param [initialDefaults] {OptionsObject}
     *
     */

    var ComposerComponent = function (_rb$Component) {
        _inherits(ComposerComponent, _rb$Component);

        function ComposerComponent() {
            _classCallCheck(this, ComposerComponent);

            return _possibleConstructorReturn(this, _rb$Component.apply(this, arguments));
        }

        ComposerComponent.prototype._createChildOptions = function _createChildOptions(componentName, opts, leaveOriginalName) {
            var _this2 = this;

            var initialDefaults = {};

            if (!leaveOriginalName) {
                initialDefaults.jsName = this.interpolateName('{name}{e}' + componentName, true);
                initialDefaults.name = this.interpolateName('{name}{e}' + componentName);
            }

            if (!this[childOptionExpando]) {
                this[childOptionExpando] = {};
            }

            opts.forEach(function (option) {
                var optionName = typeof option == 'string' ? option : option.name;
                var compute = option.computeValue;

                initialDefaults[optionName] = compute ? compute(_this2.options[optionName], optionName, _this2) : _this2.options[optionName];

                if (!_this2[childOptionExpando][optionName]) {
                    _this2[childOptionExpando][optionName] = {};
                }

                if (!_this2[childOptionExpando][optionName][componentName]) {
                    _this2[childOptionExpando][optionName][componentName] = {
                        components: [],
                        compute: compute
                    };
                }
            });

            return initialDefaults;
        };

        ComposerComponent.prototype._createChildComponent = function _createChildComponent(componentName, componentElement, initialDefaults, opts) {
            var _this3 = this;

            var component = rb.getComponent(componentElement, componentName, initialDefaults);

            opts.forEach(function (option) {
                var optionName = typeof option == 'string' ? option : option.name;

                _this3[childOptionExpando][optionName][componentName].components.push(component);
            });

            return component;
        };

        ComposerComponent.prototype.createChildComponent = function createChildComponent(componentName, componentElement, opts, leaveOriginalName) {
            var initialDefaults = this._createChildOptions(componentName, opts, leaveOriginalName);

            return this._createChildComponent(componentName, componentElement, initialDefaults, opts);
        };

        ComposerComponent.prototype.createChildComponents = function createChildComponents(componentName, componentElements, opts, leaveOriginalName) {
            var _this4 = this;

            var initialDefaults = this._createChildOptions(componentName, opts, leaveOriginalName);

            return componentElements.map(function (componentElement) {
                return _this4._createChildComponent(componentName, componentElement, initialDefaults, opts);
            });
        };

        ComposerComponent.prototype.setOption = function setOption(name, value, isSticky) {
            var _this5 = this;

            if (this[childOptionExpando] && this[childOptionExpando][name]) {
                var _loop = function _loop(optionName) {
                    var option = _this5[childOptionExpando][name][optionName];
                    var computedValue = option.compute ? option.compute(value, name, _this5) : value;

                    option.components.forEach(function (component) {
                        component.setOption(name, computedValue, isSticky);
                    });
                };

                for (var optionName in this[childOptionExpando][name]) {
                    _loop(optionName);
                }
            }

            _rb$Component.prototype.setOption.call(this, name, value, isSticky);
        };

        return ComposerComponent;
    }(rb.Component);

    rb.live.register('_composer_component', ComposerComponent);

    exports.default = ComposerComponent;
});
