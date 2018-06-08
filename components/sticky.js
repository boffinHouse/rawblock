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
        global.sticky = mod.exports;
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

    var $ = _core.Component.$;
    var isContainerScroll = { scroll: 1, auto: 1 };
    var isContainerAncestor = { parent: 'parentNode', positionedParent: 'offsetParent' };
    var docElem = document.documentElement;

    if (!_core2.default.components._childfx) {
        _core2.default.log('_childfx not included');
    }

    /**
     * Component creates a sticky element, that can be stuck to the top or the bottom of the viewport. Optionally can animate child elements after it has become stuck according to the scroll position.
     *
     * @alias rb.components.sticky
     *
     * @extends rb.components._childfx
     *
     * @param element
     * @param initialDefaults
     *
     *
     *
     * @example
     * <header class="rb-header js-rb-live" data-module="sticky">
     *     <div class="header-fx">
     *          <img class="logo" />
     *          <nav><!-- ... --></nav>
     *      </div>
     * </header>
     *
     * <style type="text/scss">
     *     .rb-header {
     *          (at)include exportToJS((
     *              container: false,
     *              progress: 100,
     *              childSel: 'find(.header-fx)',
     *          ));
     *
     *          .header-fx {
     *              padding: 20px;
     *              font-size: 16px;
     *
     *              (at)include exportToJS((
     *                  fontSize: 12,
     *                  paddingTop: 10,
     *                  paddingBottom: 10
     *              ));
     *          }
     *
     *          .logo,
     *          nav {
     *              height: 1em;
     *          }
     *     }
     * </style>
     */

    var Sticky = function (_ref) {
        _inherits(Sticky, _ref);

        Sticky.filterPos = function filterPos(pos) {
            return pos != null && pos > -1 && pos < Number.MAX_VALUE;
        };

        _createClass(Sticky, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    container: '.is{-}{name}{-}parent', // false || 'parent' || 'positionedParent' || '.selector'
                    switchedOff: false,
                    topOffset: false,
                    bottomOffset: false,
                    offsetElements: '',
                    progress: 0,
                    setWidth: true,
                    resetSwitchedOff: true,
                    autoThrottle: true,
                    scrollContainer: ''
                };
            }
        }]);

        function Sticky(element, initialDefaults) {
            _classCallCheck(this, Sticky);

            var _this = _possibleConstructorReturn(this, _ref.call(this, element, initialDefaults));

            _this.isFixed = false;
            _this.isScrollFixed = false;
            _this.checkTime = 666 + 666 * Math.random();

            _this.isProgressDone = false;
            _this.onprogress = $.Callbacks();

            _this._throttleOptions = { that: _this, unthrottle: true };

            _this.updateChilds = _this.updateChilds || $.noop;

            _this.onprogress.fireWith = _core2.default.rAF(_this.onprogress.fireWith, { throttle: true });

            _core2.default.rAFs(_this, { throttle: true }, 'updateLayout', '_setProgressClass', 'setSwitchedOffClass');

            _this.calculateLayout = _this.calculateLayout.bind(_this);
            _this.checkPosition = _core2.default.throttle(_this.checkPosition, _this._throttleOptions);

            _this.reflow = _core2.default.throttle(function () {
                if (this.checkChildReflow) {
                    this.checkChildReflow();
                }
                this.calculateLayout();
            }, { that: _this });

            _this._getElements();
            _this.calculateLayout();

            if (_this.options.switchedOff) {
                _this.setSwitchedOffClass();
            }
            return _this;
        }

        Sticky.prototype.setOption = function setOption(name, value, isSticky) {
            _ref.prototype.setOption.call(this, name, value, isSticky);

            if (name == 'switchedOff' || name == 'resetSwitchedOff' && this.options.switchedOff && this.options.resetSwitchedOff) {
                this._unfix();
                this.updateChilds(true);
                this.progress = -2;
            } else if (name == 'offsetElements' || name == 'bottomOffset' || name == 'topOffset' || name == 'switchedOff' && !value) {
                this._unfix();
                this.element.style.top = '';
                this.element.style.bottom = '';
                this._getElements();
                this.calculateLayout();
            } else if (name == 'autoThrottle' && !value && !this._throttleOptions.unthrottle) {
                this._throttleOptions.unthrottle = true;
            } else if (name == 'scrollContainer') {
                this._setScrollingElement();
            }

            if (name == 'switchedOff') {
                this.setSwitchedOffClass();
            }
        };

        Sticky.prototype.setSwitchedOffClass = function setSwitchedOffClass() {
            this.element.classList.toggle(_core2.default.statePrefix + 'switched' + _core2.default.nameSeparator + 'off', this.options.switchedOff);
        };

        Sticky.prototype._getElements = function _getElements() {
            var offsetName = void 0;

            var options = this.options;
            this.isContainerScroll = false;

            this.elemStyles = _core2.default.getStyles(this.element);

            this.offsetElements = options.offsetElements ? this.getElementsByString(options.offsetElements) : [];

            this.posProp = options.bottomOffset !== false ? 'bottom' : 'top';

            offsetName = this.posProp + 'Offset';

            this.offset = 0;

            if (options[offsetName] !== false) {
                this.offset -= options[offsetName];
            }

            if (options.container) {
                this.container = this.element[options.container] || this.element[isContainerAncestor[options.container]] || this.element.closest(this.interpolateName(options.container));
                if (this.container == document.body || this.container == docElem) {
                    this.container = null;
                } else if (this.container) {
                    this.isContainerScroll = !!isContainerScroll[$.css(this.container, 'overflowY', false, this.containerStyles) || $.css(this.container, 'overflow', false, this.containerStyles)];
                    this.containerStyles = _core2.default.getStyles(this.container);
                }
            }

            this.calcedOffset = this.offset;

            this._setScrollingElement();
        };

        Sticky.prototype._setScrollingElement = function _setScrollingElement() {
            var curScrollingEventElement = void 0;
            var oldEventElement = this.$scrollEventElem && this.$scrollEventElem.get(0);

            if (this.options.scrollContainer) {
                this.$scrollEventElem = $(this.element).closest(this.options.scrollContainer);
                curScrollingEventElement = this.$scrollEventElem.get(0);
                this.scrollingElement = curScrollingEventElement;
            }

            if (!this.options.scrollContainer || !this.scrollingElement) {
                if (this.isContainerScroll) {
                    this.$scrollEventElem = this.$container;
                    curScrollingEventElement = this.$container.get(0);
                    this.scrollingElement = curScrollingEventElement;
                } else {
                    curScrollingEventElement = window;
                    this.$scrollEventElem = $(curScrollingEventElement);
                    this.scrollingElement = document.scrollingElement;
                }
            }

            if (oldEventElement != curScrollingEventElement) {
                if (oldEventElement) {
                    $(oldEventElement).off('scroll', this.checkPosition);
                }
                this.$scrollEventElem.on('scroll', this.checkPosition);
            }
        };

        Sticky.prototype.getCalculatedLayout = function getCalculatedLayout() {
            var box = void 0,
                elemOffset = void 0,
                containerBox = void 0,
                containerOffset = void 0;

            var boxes = {
                minFixedPos: -1,
                maxFixedPos: Number.MAX_VALUE,
                minScrollPos: -1,
                maxScrollPos: Number.MAX_VALUE
            };

            box = (this.isFixed ? this.clone : this.element).getBoundingClientRect();

            if (!box.right && !box.bottom && !box.top && !box.left) {
                return boxes;
            }

            elemOffset = box[this.posProp] + this.scroll;

            if (this.offsetElements.length) {
                this.calcedOffset = this.offset - this.offsetElements.reduce(function (prevValue, element) {
                    return prevValue + element.offsetHeight;
                }, 0);
            }

            if (this.options.setWidth) {
                this.elemWidth = (this.isFixed ? this.clone : this.element).offsetWidth;
            }

            if (this.posProp == 'top') {
                boxes.minFixedPos = elemOffset + this.calcedOffset;

                if (this.options.progress) {
                    boxes.minProgressPos = boxes.minFixedPos;
                    boxes.maxProgressPos = boxes.minFixedPos + this.options.progress;
                }
            } else {
                boxes.maxFixedPos = elemOffset - this.calcedOffset - this.viewportheight;

                if (this.options.progress) {
                    boxes.minProgressPos = boxes.maxFixedPos - boxes.options.progress;
                    boxes.maxProgressPos = boxes.maxFixedPos;
                }
            }

            if (this.container) {
                containerBox = this.container.getBoundingClientRect();

                containerOffset = containerBox[this.posProp == 'top' ? 'bottom' : 'top'] + this.scroll;

                if (this.posProp == 'top') {
                    boxes.maxFixedPos = containerOffset + this.calcedOffset;

                    boxes.minScrollPos = boxes.maxFixedPos - box.height - $.css(this.container, 'padding-bottom', true, this.containerStyles) - $.css(this.element, 'margin-bottom', true, this.elemStyles);
                    boxes.maxFixedPos += 9 - this.calcedOffset;
                    boxes.maxScrollPos = boxes.maxFixedPos;
                } else {
                    boxes.minFixedPos = containerOffset - docElem.clientHeight - this.calcedOffset;
                    boxes.maxScrollPos = boxes.minFixedPos + box.height + $.css(this.container, 'padding-top', true, this.containerStyles) + $.css(this.element, 'margin-top', true, this.elemStyles);
                    boxes.minFixedPos += 9 + this.calcedOffset;
                    boxes.minScrollPos = boxes.minFixedPos;
                }
            }

            return boxes;
        };

        Sticky.prototype.calculateLayout = function calculateLayout() {

            this.scroll = this.scrollingElement.scrollTop;

            this.viewportheight = docElem.clientHeight;

            this.lastCheck = Date.now();

            Object.assign(this, this.getCalculatedLayout());

            this._poses = [this.minScrollPos, this.minFixedPos, this.maxFixedPos, this.maxScrollPos, this.minProgressPos, this.maxProgressPos].filter(Sticky.filterPos);

            this.checkPosition();
        };

        Sticky.prototype._isNearScroll = function _isNearScroll(pos) {
            var dif = this.scroll - pos;
            return dif < 700 + this.viewportheight && dif > -700 - this.viewportheight;
        };

        Sticky.prototype.checkPosition = function checkPosition() {
            if (this.options.switchedOff) {
                return;
            }

            var shouldFix = void 0,
                shouldScroll = void 0,
                shouldWidth = void 0,
                progress = void 0,
                wasProgress = void 0;

            this.scroll = this.scrollingElement.scrollTop;

            if (Date.now() - this.lastCheck > this.checkTime) {
                this.calculateLayout();
                return;
            }

            shouldFix = this.scroll >= this.minFixedPos && this.scroll <= this.maxFixedPos;
            shouldScroll = shouldFix && this.scroll >= this.minScrollPos && this.scroll <= this.maxScrollPos;

            if (this.options.autoThrottle) {
                this._throttleOptions.unthrottle = this._poses.some(this._isNearScroll, this);
            }

            if (shouldFix && !this.isFixed) {
                this.elemHeight = this.element.offsetHeight;
                if (this.options.setWidth) {
                    this.elemWidth = this.element.offsetWidth;
                }
            }

            shouldWidth = shouldFix && this.isFixed && this.options.setWidth && this.element.offsetWidth != this.elemWidth;

            if (shouldFix != this.isFixed || shouldScroll || this.isScrollFixed || shouldWidth || this.isFixed && this._setCalcedOffset != this.calcedOffset) {
                this.updateLayout(shouldFix, shouldScroll, shouldWidth);
            }

            if (this.options.progress && (shouldFix && this.scroll >= this.minProgressPos && this.scroll <= this.maxProgressPos || this.progress !== 0 && this.progress !== 1)) {
                progress = 1 - Math.max(Math.min((this.scroll - this.minProgressPos) / (this.maxProgressPos - this.minProgressPos), 1), 0);
                wasProgress = this.progress;

                if (!shouldFix && wasProgress == -2) {
                    return;
                }

                if (wasProgress != progress) {
                    this.progress = progress;

                    if (progress == 1) {
                        if (!this.isProgressDone) {
                            this.isProgressDone = true;
                            this._setProgressClass();
                        }
                    } else if (this.isProgressDone) {
                        this.isProgressDone = false;
                        this._setProgressClass();
                    }

                    this.updateChilds();
                    this.onprogress.fireWith(this, [progress]);
                }
            }
        };

        Sticky.prototype._setProgressClass = function _setProgressClass() {
            this.element.classList.toggle(_core2.default.statePrefix + 'fixed' + _core2.default.nameSeparator + 'progressed', this.isProgressDone);
        };

        Sticky.prototype.updateLayout = function updateLayout(shouldFix, shouldScroll, shouldWidth) {
            var offset = void 0,
                trigger = void 0;

            if (this.options.switchedOff) {
                return;
            }

            if (shouldWidth) {
                this.element.style.width = this.elemWidth + 'px';
            }

            if (shouldFix) {
                if (!this.isFixed) {
                    this._fix();
                    trigger = true;
                }

                if (shouldScroll) {
                    this.isScrollFixed = true;
                    offset = this.calcedOffset * -1;

                    if (this.posProp == 'top') {
                        offset += this.minScrollPos - this.scroll;
                    } else {
                        offset -= this.maxScrollPos - this.scroll;
                    }

                    this.element.style[this.posProp] = offset + 'px';
                } else if (this.isScrollFixed || this._setCalcedOffset != this.calcedOffset) {
                    this.isScrollFixed = false;
                    this.element.style[this.posProp] = this.calcedOffset * -1 + 'px';
                }
            } else if (this.isFixed) {
                this._unfix();
                trigger = true;
            }

            this._setCalcedOffset = this.calcedOffset;

            if (trigger) {
                this.trigger();
            }
        };

        Sticky.prototype._unfix = function _unfix() {
            if (!this.isFixed) {
                return;
            }

            this.isFixed = false;
            this.isScrollFixed = false;
            this.element.classList.remove(_core2.default.statePrefix + 'fixed');
            this.detachClone();
            this.element.style.position = '';
            this.element.style.width = '';
            this.element.style[this.posProp] = '';
        };

        Sticky.prototype._fix = function _fix() {
            if (this.isFixed) {
                return;
            }
            this.isFixed = true;
            this.isScrollFixed = false;
            this.attachClone();
            this.element.classList.add(_core2.default.statePrefix + 'fixed');
            this.element.style.position = 'fixed';

            if (this.options.setWidth) {
                this.element.style.width = this.elemWidth + 'px';
            }

            this.element.style[this.posProp] = this.calcedOffset * -1 + 'px';
        };

        Sticky.prototype.attachClone = function attachClone() {
            if (!this.$clone) {
                this.clone = this.element.cloneNode();
                this.$clone = $(this.clone);

                this.$clone.css({ visibility: 'hidden' }).removeClass('js' + _core2.default.nameSeparator + 'rb' + _core2.default.nameSeparator + 'live').addClass('js' + _core2.default.nameSeparator + 'sticky' + _core2.default.nameSeparator + 'clone').attr({
                    'data-module': '',
                    'aria-hidden': 'true'
                });
            }

            this.$clone.css({ height: this.elemHeight + 'px' });
            this.$element.after(this.clone);
        };

        Sticky.prototype.detachClone = function detachClone() {
            if (this.$clone) {
                this.$clone.detach();
            }
        };

        Sticky.prototype.attached = function attached() {
            this._setScrollingElement();
            _core2.default.resize.on(this.reflow);
            clearInterval(this.layoutInterval);
            this.layoutInterval = setInterval(this.reflow, Math.round(999 * Math.random() + 9999));
        };

        Sticky.prototype.detached = function detached() {
            this.$scrollEventElem.off('scroll', this.checkPosition);
            _core2.default.resize.off(this.reflow);
            clearInterval(this.layoutInterval);
            this.$scrollEventElem = null;
        };

        return Sticky;
    }(_core2.default.components._childfx || _core.Component);

    exports.default = _core.Component.register('sticky', Sticky);
});
