(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '../utils/spring-animation'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('../utils/spring-animation'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.springAnimation);
        global.springanimationdemo = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SpringAnimationDemo = exports.SpringAnimationDemoGroup = undefined;

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

    /**
     * Class component to create a SpringAnimation Demo
     *
     */

    var SpringAnimationDemoGroup = function (_rb$Component) {
        _inherits(SpringAnimationDemoGroup, _rb$Component);

        _createClass(SpringAnimationDemoGroup, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    stiffnessBase: 30,
                    stiffnessInc: 20,

                    dampingBase: 4,
                    dampingInc: 2,

                    autostart: true,
                    initialExampleCount: 4,
                    waitBetweenAnimations: 1000

                };
            }
        }, {
            key: 'events',
            get: function get() {
                return {
                    'springanimationdemoended': 'onChildDemoEnded',
                    'click:closest(.{name}-ctrl-btn)': 'onControlButtonClick'
                };
            }
        }]);

        function SpringAnimationDemoGroup(element, initialDefaults) {
            _classCallCheck(this, SpringAnimationDemoGroup);

            var _this = _possibleConstructorReturn(this, _rb$Component.call(this, element, initialDefaults));

            _this.allEnded = true;
            _this.childsWereAtEnd = false;

            _this.templates = Object.assign({}, _this.templates, {
                childTemplate: rb.template(_this.query('.{name}-child-template').innerHTML)
            });

            _this.rAFs({ that: _this }, 'createChildComponents', 'removeChildComponent');

            _this.getElements();
            _this.updateControlStates();
            _this.onChildDemoEnded = rb.debounce(_this.onChildDemoEnded, { delay: 100 });
            _this.createChildComponents(_this.options.initialExampleCount);
            return _this;
        }

        SpringAnimationDemoGroup.prototype.setOption = function setOption(name, value, isSticky) {
            _rb$Component.prototype.setOption.call(this, name, value, isSticky);

            switch (name) {
                case 'autostart':
                    this.updateControlStates();
                    if (this.allEnded && value) {
                        this.restartChildComponents();
                    }
                    break;
                default:
                    this.log('unknown option was set');
                    break;
            }

            // this.log(name, value, isSticky);
        };

        SpringAnimationDemoGroup.prototype.getElements = function getElements() {
            this.childWrapper = this.query('.{name}-childwrapper');
            this.inputAutostart = this.query('input[data-{name}-button-type="autostart"]');
        };

        SpringAnimationDemoGroup.prototype.updateControlStates = function updateControlStates() {
            this.inputAutostart.checked = this.options.autostart;
        };

        SpringAnimationDemoGroup.prototype.createChildComponents = function createChildComponents(count) {
            var o = this.options;

            for (var i = 0; i < count; i++) {
                this.childWrapper.insertAdjacentHTML('beforeend', this.render('childTemplate', {
                    stiffness: o.stiffnessBase + o.stiffnessInc * i,
                    damping: o.dampingBase + o.dampingInc * i
                }));
            }

            this.getChildComponents();

            if (o.autostart) {
                this.restartChildComponents();
            }
        };

        SpringAnimationDemoGroup.prototype.addChildComponent = function addChildComponent() {
            var o = this.options;
            var latestChild = this.childCompontents[this.childCompontents.length - 1];
            var stiffness = (latestChild ? latestChild.options.stiffness : o.stiffnessBase) + o.stiffnessInc;
            var damping = (latestChild ? latestChild.options.damping : o.dampingBase) + o.dampingInc;

            this.childWrapper.insertAdjacentHTML('beforeend', this.render('childTemplate', { stiffness: stiffness, damping: damping }));
            this.getChildComponents();

            // start added springdemo
            this.childCompontents[this.childCompontents.length - 1].createSpring(this.childsWereAtEnd);
        };

        SpringAnimationDemoGroup.prototype.removeChildComponent = function removeChildComponent(childComp) {
            var childCompToRemove = childComp || this.childCompontents[this.childCompontents.length - 1];
            childCompToRemove.element.remove();
            this.getChildComponents();
        };

        SpringAnimationDemoGroup.prototype.getChildComponents = function getChildComponents() {
            return this.childCompontents = this.queryAll('[data-module="springanimationdemo"]').map(function (element) {
                return rb.getComponent(element);
            });
        };

        SpringAnimationDemoGroup.prototype.onChildDemoEnded = function onChildDemoEnded() {
            var _this2 = this;

            this.allEnded = this.childCompontents.reduce(function (previousValue, childComp) {
                return previousValue && childComp.ended;
            }, true);

            if (this.allEnded) {
                this.childsWereAtEnd = !this.childsWereAtEnd;

                if (this.options.autostart) {
                    this.allEnded = false;
                    setTimeout(function () {
                        _this2.restartChildComponents();
                    }, this.options.waitBetweenAnimations);
                }
            }
        };

        SpringAnimationDemoGroup.prototype.onControlButtonClick = function onControlButtonClick(event) {
            var type = event.target.getAttribute(this.interpolateName('data-{name}-button-type'));

            switch (type) {
                case 'add':
                    this.addChildComponent();
                    break;
                case 'remove':
                    this.removeChildComponent();
                    break;
                case 'autostart':
                    this.setOption('autostart', !!event.target.checked);
                    break;
                case 'toggle':
                    this.startStop();
                    break;
                default:
                    this.logWarn('unknown control button type:', type);
            }
        };

        SpringAnimationDemoGroup.prototype.startStop = function startStop() {
            if (!this.childCompontents) {
                this.getChildComponents();
            }

            if (this.allEnded) {
                this.restartChildComponents();
            } else {
                this.allEnded = true;
                this.childCompontents.forEach(function (childComp) {
                    return childComp.stopSpring();
                });
            }
        };

        SpringAnimationDemoGroup.prototype.restartChildComponents = function restartChildComponents() {
            var _this3 = this;

            if (!this.childCompontents) {
                this.getChildComponents();
            }
            this.childCompontents.forEach(function (childComp) {
                return childComp.createSpring(_this3.childsWereAtEnd);
            });
            this.allEnded = false;
        };

        return SpringAnimationDemoGroup;
    }(rb.Component);

    var SpringAnimationDemo = function (_rb$Component2) {
        _inherits(SpringAnimationDemo, _rb$Component2);

        _createClass(SpringAnimationDemo, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    stiffness: 50,
                    damping: 50
                };
            }
        }, {
            key: 'events',
            get: function get() {
                return {
                    'rb_layoutchange': 'readLayout',
                    'input:matches([data-{name}-controls)]': 'onControlInput'
                };
            }
        }]);

        function SpringAnimationDemo(element, initialDefaults) {
            _classCallCheck(this, SpringAnimationDemo);

            var _this4 = _possibleConstructorReturn(this, _rb$Component2.call(this, element, initialDefaults));

            _this4.maxPos = null;
            _this4.springAnimation = null;
            _this4.latestValue = 0;
            _this4.wasAtEnd = false;
            _this4._hasEnded = true;

            // elements
            _this4.animateElement = _this4.query('.{name}-element');
            _this4.inputsForOptions = _this4.queryAll('[data-{name}-controls]').reduce(function (inputsForOptions, el) {
                var optionName = el.getAttribute(_this4.interpolateName('data-{name}-controls'));
                inputsForOptions[optionName] = inputsForOptions[optionName] || [];
                inputsForOptions[optionName].push(el);
                return inputsForOptions;
            }, {});

            _this4.readLayout();
            return _this4;
        }

        SpringAnimationDemo.prototype.setOption = function setOption(name, value, isSticky) {
            _rb$Component2.prototype.setOption.call(this, name, value, isSticky);
            if (this.springAnimation && name in this.springAnimation) {
                this.springAnimation[name] = value;
            }
        };

        SpringAnimationDemo.prototype.onControlInput = function onControlInput(event) {
            var optionUpdated = event.target.getAttribute(this.interpolateName('data-{name}-controls'));

            if (!optionUpdated || !(optionUpdated in this.options)) {
                return;
            }
            var newValue = parseFloat(event.target.value) || 0;
            var inputsForOption = this.inputsForOptions[optionUpdated] || [];

            inputsForOption.forEach(function (input) {
                // if(input !== event.target){
                input.value = newValue;
                // }
            });

            this.setOption(optionUpdated, newValue);
        };

        SpringAnimationDemo.prototype.readLayout = function readLayout() {
            var newMaxPos = this.element.clientWidth - this.animateElement.clientWidth;

            if (newMaxPos === this.maxPos) {
                return;
            }

            this.maxPos = newMaxPos;

            if (this.springAnimation) {
                this.springAnimation.target = this.wasAtEnd && this.springAnimation.currentValue === this.maxPos ? 0 : this.maxPos;
            }
        };

        SpringAnimationDemo.prototype.createSpring = function createSpring(wasAtEnd, opts) {
            var _this5 = this;

            if (!this._hasEnded) {
                return;
            }

            this.wasAtEnd = !!wasAtEnd;

            var springOpts = Object.assign({
                from: this.latestValue || (!this.wasAtEnd ? 0 : this.maxPos),
                target: this.wasAtEnd ? 0 : this.maxPos,
                stiffness: this.options.stiffness,
                damping: this.options.damping,
                start: function start() {
                    // add callback for start
                },
                stop: function stop() {
                    _this5._hasEnded = true;
                },
                progress: function progress(data) {
                    // this.log(this.animateElement, data);
                    _this5.setElPos(data);
                },
                complete: function complete() {
                    _this5._hasEnded = true;
                    _this5.trigger('ended');
                    _this5.updateStateClass();
                }
            }, opts);

            this.springAnimation = new rb.SpringAnimation(springOpts);
            this._hasEnded = false;
            this.updateStateClass();
        };

        SpringAnimationDemo.prototype.stopSpring = function stopSpring() {
            if (this.springAnimation) {
                this.springAnimation.stop();
            }
        };

        SpringAnimationDemo.prototype.updateStateClass = function updateStateClass() {
            $(this.animateElement).rbToggleState('spring{-}animated', !this._hasEnded);
        };

        SpringAnimationDemo.prototype.setElPos = function setElPos(data) {
            // instead... draw canvas!
            this.animateElement.style.transform = 'translateX(' + data.currentValue + 'px)';
            this.latestValue = data.currentValue;
        };

        SpringAnimationDemo.prototype.detached = function detached() {
            if (this.springAnimation) {
                this.springAnimation.stop();
                this.springAnimation = null;
            }
            this.trigger('removed');
        };

        _createClass(SpringAnimationDemo, [{
            key: 'ended',
            get: function get() {
                return this._hasEnded;
            }
        }]);

        return SpringAnimationDemo;
    }(rb.Component);

    rb.live.register('springanimationdemogroup', SpringAnimationDemoGroup);

    exports.SpringAnimationDemoGroup = SpringAnimationDemoGroup;
    exports.SpringAnimationDemo = SpringAnimationDemo;
    exports.default = rb.live.register('springanimationdemo', SpringAnimationDemo);
});
