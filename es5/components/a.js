(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['mobx', './a_state'], factory);
    } else if (typeof exports !== "undefined") {
        factory(require('mobx'), require('./a_state'));
    } else {
        var mod = {
            exports: {}
        };
        factory(global.mobx, global.a_state);
        global.a = mod.exports;
    }
})(this, function (_mobx, _a_state) {
    'use strict';

    var _mobx2 = _interopRequireDefault(_mobx);

    var _a_state2 = _interopRequireDefault(_a_state);

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

    var rb = window.rb;

    rb.log(_a_state2.default, _mobx2.default);

    /**
     * Class component to create a A.
     *
     * @alias rb.components.a
     *
     * @extends rb.Component
     *
     * @param element {Element}
     * @param [initialDefaults] {OptionsObject}
     *
     * @fires componentName#changed
     *
     * @example
     * <div class="js-rb-live" data-module="a"></div>
     */

    var A = function (_rb$Component) {
        _inherits(A, _rb$Component);

        _createClass(A, null, [{
            key: 'defaults',
            get: function get() {
                return {};
            }
        }]);

        function A(element, initialDefaults) {
            _classCallCheck(this, A);

            var _this = _possibleConstructorReturn(this, _rb$Component.call(this, element, initialDefaults));

            _this.renderFoo = _mobx2.default.autorun(_this.renderFoo.bind(_this));
            return _this;
        }

        A.prototype.renderFoo = function renderFoo() {
            this.$element.htmlRaf(_a_state2.default.foo);
        };

        return A;
    }(rb.Component);

    rb.live.register('a', A);
});
