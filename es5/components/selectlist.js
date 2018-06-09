(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports !== "undefined") {
        factory();
    } else {
        var mod = {
            exports: {}
        };
        factory();
        global.selectlist = mod.exports;
    }
})(this, function () {
    'use strict';

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

    var Selectlist = function (_rb$Component) {
        _inherits(Selectlist, _rb$Component);

        _createClass(Selectlist, null, [{
            key: 'events',
            get: function get() {
                return {
                    listboxchanged: function listboxchanged() {
                        this.panelgroup.closeAll();
                    }
                };
            }
        }]);

        function Selectlist(element, initialDefaults) {
            _classCallCheck(this, Selectlist);

            var _this = _possibleConstructorReturn(this, _rb$Component.call(this, element, initialDefaults));

            _this.createSubComponents();
            return _this;
        }

        Selectlist.prototype.createSubComponents = function createSubComponents() {
            var _this2 = this;

            Promise.all([rb.live.import('panelgroup'), rb.live.import('panelgroup')]).then(function () {
                _this2.panelgroup = _this2.component('.{name}-panelgroup', 'panelgroup', {
                    closeOnFocusout: true,
                    autofocusSel: _this2.interpolateName('.{name}-listbox'),
                    closeOnEsc: true
                });

                _this2.listbox = _this2.component('.{name}-listbox', 'listbox');
            });
        };

        return Selectlist;
    }(rb.Component);

    rb.live.register('selectlist', Selectlist);
});
