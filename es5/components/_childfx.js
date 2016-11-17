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
        global._childfx = mod.exports;
    }
})(this, function () {
    'use strict';

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

    var rb = window.rb;
    var $ = rb.$;
    var pseudoExpando = rb.Symbol('childfxPseudo');

    /**
     * Abstract class that can be extended to animate child elements according to a progress property.
     *
     * @extends rb.Component
     * @alias rb.components._childfx
     *
     * @param element
     * @param initialDefaults
     *
     * @example
     * <style type="sass">
     *     .rb-main {
     *          .child-fx {
     *              top: 0;
     *              transition: all 50ms;
     *
     *              (at)include exportToJS((
     *                  top: 50,
     *                  //complicated values like transform/backgroundColor...
     *                  rotate: (
     *                      start: "rotate(0deg)",
     *                      end: "rotate(10deg)",
     *                  )
     *              ));
     *          }
     *     }
     * </style>
     *
     * <div class="rb-main js-rb-live" data-module="childfxExtension">
     *     <img class="logo" src="..." />
     * </div>
     *
     * <script>
     * rb.components._childfx.extend('childfxExtension', {
     *      init: function(element, initialDefaults){
     *          this._super(element, initialDefaults);
     *          this.pos();
     *      },
     *      pos: function(){
     *          this.progress = 0.4; //set number between 0 - 1.
     *          this.updateChilds();
     *      }
     * });
     * </script>
     */

    var _ChildFX = function (_rb$Component) {
        _inherits(_ChildFX, _rb$Component);

        _ChildFX.toNumber = function toNumber(i) {
            return parseFloat(i) || 0;
        };

        _createClass(_ChildFX, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    switchedOff: false,
                    childSel: 'find(.{name}{e}fx)'
                };
            }
        }]);

        function _ChildFX(element, initialDefaults) {
            _classCallCheck(this, _ChildFX);

            var _this = _possibleConstructorReturn(this, _rb$Component.call(this, element, initialDefaults));

            _this.progress = -2;
            _this.updateChilds = rb.rAF(_this.updateChilds);
            return _this;
        }

        _ChildFX.prototype.getCssValue = function getCssValue(elem, prop, options, styles) {
            var value = {};
            var endValue = options.end[prop];

            if ((typeof endValue === 'undefined' ? 'undefined' : _typeof(endValue)) == 'object') {

                Object.assign(value, endValue);
                options.end[prop] = endValue.value || 0;

                if ('start' in endValue) {
                    value.value = endValue.start;
                }
            }

            value.value = value.value != null ? value.value : $.css(elem, prop, 1, styles);

            if (typeof value.value == 'string' && typeof options.end[prop] == 'string') {
                value.template = value.value;
                value.value = (value.value.match(_ChildFX.regNumber) || [0]).map(_ChildFX.toNumber);
                options.end[prop] = (options.end[prop].match(_ChildFX.regNumber) || [0]).map(_ChildFX.toNumber);
            }

            return value;
        };

        _ChildFX.prototype.setupChilds = function setupChilds() {
            var _this2 = this;

            this.childs = this.getElementsByString(this.options.childSel, this.element);

            this.childAnimations = this.childs.map(function (elem) {
                var prop = void 0;
                var styles = rb.getStyles(elem);

                var options = {
                    start: {},
                    end: Object.assign({}, rb.parsePseudo(elem, pseudoExpando), rb.parseDataAttrs(elem)),
                    from: 0,
                    to: 1
                };

                for (prop in options.end) {
                    if (prop == 'easing') {
                        options.easing = rb.addEasing(options.end[prop]);
                    } else if (prop == 'from' || prop == 'to') {
                        options[prop] = options.end[prop];
                    } else {
                        options.start[prop] = _this2.getCssValue(elem, prop, options, styles);
                    }
                }

                return options;
            });
        };

        _ChildFX.prototype.checkChildReflow = function checkChildReflow() {
            var ret = false;

            if (this.childs && this.childs.length && !this.options.switchedOff) {
                this.childs.forEach(function (elem) {
                    if (!ret && rb.hasPseudoChanged(elem, pseudoExpando)) {
                        ret = true;
                    }
                });
            }

            if (ret) {
                this.updateChilds._rbUnrafedFn.call(this, true);
                this.progress = -2;
            }

            return ret;
        };

        _ChildFX.prototype.updateChilds = function updateChilds(empty) {
            var eased = void 0,
                i = void 0,
                len = void 0,
                animOptions = void 0,
                elem = void 0,
                eStyle = void 0,
                prop = void 0,
                value = void 0,
                option = void 0,
                isString = void 0,
                i2 = void 0,
                retFn = void 0,
                progress = void 0;

            empty = empty === true;

            if (!this.childs || !this.childAnimations) {
                if (empty) {
                    return;
                }
                this.setupChilds();
            }

            for (i = 0, len = this.childs.length; i < len; i++) {
                elem = this.childs[i];
                animOptions = this.childAnimations[i];
                progress = this.progress;
                eStyle = elem.style;

                if (!empty) {
                    if (animOptions.from > progress) {
                        progress = 0;
                    } else if (animOptions.to < progress) {
                        progress = 1;
                    } else if (animOptions.to < 1 || animOptions.from > 0) {
                        progress -= animOptions.from;
                        progress *= 1 / (1 - (1 - animOptions.to) - animOptions.from);
                    }

                    eased = animOptions.easing ? animOptions.easing(progress) : progress;
                }

                for (prop in animOptions.start) {
                    option = animOptions.start[prop];
                    value = option.value;

                    if (!empty) {
                        if (isString = option.template) {
                            i2 = 0;
                            if (!retFn) {
                                /*jshint loopfunc: true */
                                retFn = function retFn() {
                                    // eslint-disable-line no-loop-func
                                    var value = (animOptions.end[prop][i2] - option.value[i2]) * eased + option.value[i2];
                                    i2++;
                                    if (prop == 'backgroundColor') {
                                        value = Math.round(value);
                                    }
                                    return value;
                                };
                            }
                            value = option.template.replace(_ChildFX.regNumber, retFn);
                        } else {
                            value = (animOptions.end[prop] - option.value) * eased + option.value;
                        }
                    }

                    if (prop in eStyle) {
                        if (!isString && !$.cssNumber[prop]) {
                            value += 'px';
                        }
                        eStyle[prop] = empty ? '' : value;
                    } else {
                        elem[prop] = value;
                    }
                }
            }
            if (empty) {
                this.childs = null;
                this.childAnimations = null;
            }
        };

        return _ChildFX;
    }(rb.Component);

    _ChildFX.regNumber = /(-*\d+[.\d]*)/g;
    _ChildFX.regWhite = /\s/g;

    rb.live.register('_childfx', _ChildFX);
});
