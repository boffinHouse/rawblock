(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '../utils/rb_springAnimation'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('../utils/rb_springAnimation'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.rb_springAnimation);
        global.springanimationdemo = mod.exports;
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
    // const $ = rb.$;

    /**
     * Class component to create a SpringAnimation Demo
     *
     */

    var SpringAnimationDemo = function (_rb$Component) {
        _inherits(SpringAnimationDemo, _rb$Component);

        _createClass(SpringAnimationDemo, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    // measureElement: 'self',
                    // items: '.children(.{name}{e}item)',
                    // toggleItemSelector: '.is{-}toggle{-}item',
                    // togglePanel: 'find(.{name}{e}panel)',
                    // minItems: 2,
                    // minSubItems: 2,
                    // growItems: false,
                };
            }
        }, {
            key: 'events',
            get: function get() {}
        }]);

        function SpringAnimationDemo(element, initialDefaults) {
            _classCallCheck(this, SpringAnimationDemo);

            var _this = _possibleConstructorReturn(this, _rb$Component.call(this, element, initialDefaults));

            _this.animateElement = _this.query('.{name}-element');

            // this.setElPos = this.setElPos.bind(this);

            setTimeout(function () {
                _this.createSpring();
            });
            return _this;
        }

        SpringAnimationDemo.prototype.createSpring = function createSpring() {
            var _this2 = this;

            this.springAnimation = new rb.SpringAnimation({
                from: 0,
                target: 100,
                progress: function progress(data) {
                    _this2.log(_this2.animateElement, data);
                    _this2.setElPos(data);
                },
                complete: function complete() {
                    _this2.log('competed this', _this2);
                }
            });

            this.log('created spring', this, this.springAnimation);
        };

        SpringAnimationDemo.prototype.setElPos = function setElPos(data) {
            // console.log(this.);
            this.animateElement.style.transform = 'translateX(' + data.currentValue + 'px)';
        };

        return SpringAnimationDemo;
    }(rb.Component);

    exports.default = rb.live.register('springanimationdemo', SpringAnimationDemo);
});
