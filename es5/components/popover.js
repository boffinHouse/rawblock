(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './panel', '../utils/position'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./panel'), require('../utils/position'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.panel, global.position);
        global.popover = mod.exports;
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
    var $ = rb.$;

    var Position = rb.Position;

    /**
     * Creates a popover that is positioned/anchored to another element.
     *
     * A11y-Notes: If the popover has structured content use the class `js-rb-autofocus` inside of/at the popover. If it contains simple text use a aria-live="polite" or an appropriate role.
     *
     * @alias rb.components.popover
     *
     * @extends rb.components.panel
     *
     * @param element
     * @param initialDefaults
     *
     * @example
     * <button aria-controls="popover-1" data-module="panelbutton" type="button" class="js-rb-click">button</button>
     * <div id="popover-1" data-module="popover">
     *    {{popoverContent}}
     * </div>
     */

    var Popover = function (_rb$components$panel) {
        _inherits(Popover, _rb$components$panel);

        _createClass(Popover, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    positioned: true,
                    my: 'center bottom',
                    at: 'center top',
                    collision: 'flip',
                    anchor: 'button', // 'button' || 'activeButton' || 'id' || closest(.bla) || sel(.yo)
                    updateOnResize: true,
                    closeOnOutsideClick: true,
                    closeOnEsc: true,
                    setDisplay: true
                };
            }
        }]);

        function Popover(element, initialDefaults) {
            _classCallCheck(this, Popover);

            var _this = _possibleConstructorReturn(this, _rb$components$panel.call(this, element, initialDefaults));

            _this.reflow = rb.throttle(_this._reflow, { that: _this });
            _this.scrollRepostion = _this.scrollRepostion.bind(_this);

            if (_this.options.positioned) {
                _this.setOption('positioned', true);
            }
            return _this;
        }

        Popover.prototype.setOption = function setOption(name, value, isSticky) {
            var options = this.options;
            _rb$components$panel.prototype.setOption.call(this, name, value, isSticky);

            if (name == 'positioned') {
                if (value) {
                    if (!this.position) {
                        this.initPositionedElement();
                    } else {
                        this.$element.css({ position: 'absolute' });
                    }
                } else {
                    this.$element.css({ position: '', left: '', top: '' });
                }
            } else if (this.position && name == 'my' || name == 'at' || name == 'collision') {
                this.position.setOptions({
                    my: options.my,
                    at: options.at,
                    collision: options.collision
                });
            }
        };

        Popover.prototype.initPositionedElement = function initPositionedElement() {
            var that = this;

            this.position = new Position(this.element);

            rb.rAFQueue(function () {
                that.$element.css({ display: 'block' });
            });
            this.setOption('my', this.options.my);
        };

        Popover.prototype._reflow = function _reflow(e) {
            if (!rb.root.contains(this.element)) {
                this.teardownPopoverResize();
                return;
            }
            if (!e || this.options.updateOnResize) {
                this.connect(false, this.lastOpeningOptions);
            }
        };

        Popover.prototype.scrollRepostion = function scrollRepostion(e) {
            if (!rb.root.contains(this.element)) {
                this.teardownPopoverResize();
                return;
            }

            if (!e || this.options.updateOnResize && e.target.contains && this.getAnchor(this.lastOpeningOptions)) {
                this._reflow();
            }
        };

        Popover.prototype.setupPopoverResize = function setupPopoverResize() {
            this.teardownPopoverResize();
            window.addEventListener('resize', this.reflow);
            document.addEventListener('scroll', this.scrollRepostion, true);
        };

        Popover.prototype.teardownPopoverResize = function teardownPopoverResize() {
            window.removeEventListener('resize', this.reflow);
            document.removeEventListener('scroll', this.scrollRepostion, true);
        };

        Popover.prototype.getAnchor = function getAnchor(options) {
            var anchor = options && options.anchor || this.options.anchor || '';

            if (anchor.nodeType != 1) {
                if (anchor == 'activeButton') {
                    anchor = this.activeButtonComponent && this.activeButtonComponent.element || this.buttonComponent && this.buttonComponent.element;
                } else if (Popover.mainbutton[anchor]) {
                    anchor = this.buttonComponent && this.buttonComponent.element || this.activeButtonComponent && this.activeButtonComponent.element;
                } else if (typeof anchor == 'string') {
                    anchor = rb.elementFromStr(anchor, this.element)[0];
                }
            }

            return anchor;
        };

        Popover.prototype.connect = function connect(isOpening, options) {
            var anchor = (isOpening || this.isOpen) && this.getAnchor(options);

            if (anchor && this.position) {
                this.position.connect(anchor);
            }
        };

        Popover.prototype.open = function open(options) {
            var isOpening = _rb$components$panel.prototype.open.call(this, options);
            this.lastOpeningOptions = options;

            if (this.options.positioned) {
                if ($.css(this.element, 'display') == 'none') {
                    this.element.style.display = typeof this.options.setDisplay == 'string' ? this.options.setDisplay : 'block';
                }

                this.connect(isOpening, options);

                if (isOpening && this.options.updateOnResize) {
                    this.setupPopoverResize();
                }
            }

            return isOpening;
        };

        Popover.prototype.close = function close(_options) {
            var isClosing = _rb$components$panel.prototype.close.call(this, _options);

            if (this.options.positioned) {
                if (isClosing) {
                    this.lastOpeningOptions = null;
                    this.teardownPopoverResize();
                }
            }

            return isClosing;
        };

        return Popover;
    }(rb.components.panel);

    Object.assign(Popover, {
        mainbutton: {
            button: 1,
            mainButton: 1,
            panelButton: 1
        }
    });

    rb.live.register('popover', Popover);

    exports.default = Popover;
});
