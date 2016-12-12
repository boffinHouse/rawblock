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
        global.scrolly = mod.exports;
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

    var docElem = rb.root;

    /**
     * Adds a class `is-in-scrollrange` if component is inside of a defined viewport range. Additionally can animate child elements based on this range progress.
     *
     * @alias rb.components.scrolly
     *
     * @param element
     * @param initialDefaults
     *
     * @extends rb.components._childfx
     *
     * @example
     * <style type="sass">
     *     .rb-logos {
     *          (at)include rb-js-export((
     *              from: '-50eh',
     *              to: '100vh - 50eh',
     *              once: true,
     *              throttleDelay: 300,
     *          ));
     *
     *          .logo {
     *              opacity: 0;
     *              transition: all 400ms;
     *          }
     *
     *          &.is-in-scrollrange {
     *              .logo {
     *                  opacity: 1;
     *              }
     *          }
     *     }
     * </style>
     *
     * <div class="rb-logos js-rb-live" data-module="scrolly">
     *     <img class="logo" src="..." />
     * </div>
     *
     * @example
     * <style type="scss">
     *     .rb-logo {
     *          (at)include rb-js-export((
     *              from: "-50eh",
     *              to: "100vh - 50eh",
     *              once: true,
     *              throttleDelay: 100,
     *              childSel: 'find(.logo-item)',
     *          ));
     *
     *          .logo-item {
     *              top: 0;
     *              transition: all 50ms;
     *
     *              (at)include rb-js-export((
     *                  top: 50,
     *                  //complicated values like transform/backgroundColor...
     *                  rotate: (
     *                      start: "rotate(0deg)",
     *                      value: "rotate(10deg)",
     *                  )
     *              ));
     *          }
     *     }
     * </style>
     *
     * <div class="rb-logos js-rb-live" data-module="scrolly">
     *     <img class="logo" src="..." />
     * </div>
     *
     */

    var Scrolly = function (_ref) {
        _inherits(Scrolly, _ref);

        _createClass(Scrolly, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    switchedOff: false,
                    from: '-100eh',
                    to: '100vh',
                    once: false,
                    restSwitchedOff: true,
                    throttleDelay: 0,
                    fixedSel: 'find(.{name}{e}scrollfixed)',
                    setFixedWidth: true,
                    preparePadding: 0,
                    scrollContainer: false
                };
            }
        }]);

        function Scrolly(element, initialDefaults) {
            _classCallCheck(this, Scrolly);

            var _this = _possibleConstructorReturn(this, _ref.call(this, element, initialDefaults));

            _this.minScroll = Number.MAX_VALUE;
            _this.maxScroll = -1;

            _this.checkTime = 4000 + 999 * Math.random();

            _this.entered = false;

            _this.onprogress = $.Callbacks();

            _this.updateChilds = _this.updateChilds || $.noop;

            rb.rAFs(_this, { throttle: true }, 'changeState', 'setSwitchedOffClass', 'updateScrollFixedElement', 'changePrepareState');

            rb.rAFs(_this.onprogress, 'fireWith');

            _this.checkPosition = _this.checkPosition.bind(_this);
            _this.calculateLayout = _this.calculateLayout.bind(_this);
            _this._setupThrottleDelay(_this.options.throttleDelay);

            _this.reflow = rb.throttle(function () {
                if (this.checkChildReflow) {
                    this.checkChildReflow();
                }
                this.calculateLayout();
            }, { that: _this });

            _this._setScrollinElement();
            _this.parseOffsets();
            _this.calculateLayout();

            if (_this.options.switchedOff) {
                _this.setSwitchedOffClass();
            }
            return _this;
        }

        Scrolly.prototype._setupThrottleDelay = function _setupThrottleDelay(delay) {
            if (delay && delay > 30) {
                this.throtteldCheckPosition = rb.throttle(this.checkPosition, { delay: delay });
            } else {
                this.throtteldCheckPosition = this.checkPosition;
            }
        };

        Scrolly.prototype.setOption = function setOption(name, value, isSticky) {
            _ref.prototype.setOption.call(this, name, value, isSticky);

            if (name == 'switchedOff' || name == 'restSwitchedOff' && this.options.switchedOff && this.options.restSwitchedOff) {
                this.changeState(false);
                this.updateChilds(true);
                this.progress = -2;
            } else if (name == 'from' || name == 'to' || name == 'switchedOff' && !value) {
                this.parseOffsets();
                this.calculateLayout();
            } else if (name == 'throttleDelay') {
                this.detached();
                this._setupThrottleDelay(value);
                if (rb.root.contains(this.element)) {
                    this.attached();
                }
            } else if (name == 'scrollContainer') {
                this._setScrollinElement();
                this.calculateLayout();
            }

            if (name == 'switchedOff') {
                this.setSwitchedOffClass();
            }
        };

        Scrolly.prototype.setSwitchedOffClass = function setSwitchedOffClass() {
            this.element.classList[this.options.switchedOff ? 'add' : 'remove'](rb.statePrefix + 'switched' + rb.nameSeparator + 'off');
        };

        Scrolly.prototype.parseOffsets = function parseOffsets() {
            this.parsedFrom = this.parseOffset(this.options.from);
            this.parsedTo = this.parseOffset(this.options.to);
        };

        Scrolly.prototype.parseOffset = function parseOffset(val) {
            var prop = void 0;

            val = ('' + val).replace(Scrolly.regWhite, '');

            var match = Scrolly.regCalc.exec(val);

            var parsedPos = {};

            while (match != null) {
                prop = Scrolly.knownUnits[match[3]] ? match[3] : 'px';
                parsedPos[prop] = parseFloat(match[2]);
                match = Scrolly.regCalc.exec(val);
            }

            return parsedPos;
        };

        Scrolly.prototype.addOffset = function addOffset(offset) {
            var prop = void 0,
                element = void 0,
                dimProp = void 0;

            var value = 0;

            for (prop in offset) {
                if (prop == 'eh' || prop == 'ev') {
                    element = this.element;
                } else if (prop == 'vw' || prop == 'vh') {
                    element = docElem;
                }

                if (element) {
                    dimProp = prop.charAt(1) == 'w' ? 'clientWidth' : 'clientHeight';
                    value += element[dimProp] / 100 * offset[prop];
                } else {
                    value += offset[prop];
                }
            }
            return value;
        };

        Scrolly.prototype.calculateLayout = function calculateLayout() {

            if (this.options.switchedOff) {
                return;
            }
            var box = this.element.getBoundingClientRect();

            this.lastCheck = Date.now();

            if (!box.top && !box.bottom && !box.right && !box.left) {
                return;
            }

            this.boxTop = box.top + this.scrollingElement.scrollTop;
            this.boxWidth = box.width;
            this.scrollPos = this.scrollingElement.scrollTop;

            this.minScroll = this.boxTop;
            this.maxScroll = this.minScroll;

            this.minScroll -= this.addOffset(this.parsedTo);
            this.maxScroll -= this.addOffset(this.parsedFrom);

            this.minFixed = this.minScroll - 666;
            this.maxFixed = this.maxScroll + 666;

            this.minPrepareScroll = this.minScroll - this.options.preparePadding;
            this.maxPrepareScroll = this.maxScroll + this.options.preparePadding;

            this.scrollFixedElement = this.getElementsByString(this.options.fixedSel)[0];

            this.checkPosition();
        };

        Scrolly.prototype.checkPosition = function checkPosition() {
            var that = void 0,
                wasProgress = void 0,
                shouldEnter = void 0,
                shouldEnterScrollFix = void 0,
                prepareEntered = void 0,
                progress = void 0;

            if (this.options.switchedOff) {
                return;
            }

            var pos = this.scrollingElement.scrollTop;

            this.scrollPos = pos;

            if (Date.now() - this.lastCheck > this.checkTime) {
                this.lastCheck = Date.now();
                rb.rIC(this.calculateLayout);
            }

            shouldEnterScrollFix = this.minFixed <= pos && this.maxFixed >= pos;
            prepareEntered = this.minPrepareScroll <= pos && this.maxPrepareScroll >= pos;
            shouldEnter = prepareEntered && shouldEnterScrollFix && this.minScroll <= pos && this.maxScroll >= pos;

            if (shouldEnter || this.progress !== 0 && this.progress !== 1) {
                progress = Math.max(Math.min((pos - this.minScroll) / (this.maxScroll - this.minScroll), 1), 0);
                wasProgress = this.progress;
                this.progress = progress;

                if (wasProgress == progress || wasProgress == -2 && !progress) {
                    return;
                }

                this.updateChilds();
                this.onprogress.fireWith(this, [progress]);

                if (this.options.once === true && this.progress === 1) {
                    that = this;
                    shouldEnter = true;
                    rb.rAFQueue(function () {
                        that.destroy();
                    });
                }
            }

            if (this.scrollFixedElement && (shouldEnterScrollFix || shouldEnterScrollFix != this.enteredFixed)) {
                this.updateScrollFixedElement(shouldEnterScrollFix);
            }

            if (this.prepareEntered != prepareEntered) {
                this.prepareEntered = prepareEntered;
                this.changePrepareState();
            }

            if (this.entered != shouldEnter) {
                this.changeState(shouldEnter);
            }
        };

        Scrolly.prototype.updateScrollFixedElement = function updateScrollFixedElement(isEntered) {
            var elemStyle = this.scrollFixedElement.style;

            if (this.enteredFixed != isEntered) {
                this.scrollFixedElement.classList.toggle(rb.statePrefix + 'fixed-entered', isEntered);
                if (isEntered) {
                    elemStyle.position = 'fixed';
                }
            }

            if (isEntered) {
                elemStyle.top = this.boxTop - this.scrollPos + 'px';

                if (this.options.setFixedWidth && this.boxWidth != this.setBoxWidth) {
                    this.setBoxWidth = this.boxWidth;
                    elemStyle.width = this.boxWidth + 'px';
                }
            } else {
                elemStyle.position = '';
                elemStyle.top = '';

                if (this.options.setFixedWidth) {
                    this.setBoxWidth = '';
                    elemStyle.width = '';
                }
            }

            this.enteredFixed = isEntered;
        };

        Scrolly.prototype.changePrepareState = function changePrepareState() {
            this.element.classList.toggle(rb.statePrefix + 'scrollrange' + rb.nameSeparator + 'prepared', this.prepareEntered);
        };

        Scrolly.prototype.changeState = function changeState(shouldEnter) {
            var once = this.options.once;

            if (this.entered != shouldEnter) {
                this.entered = shouldEnter;
                this.element.classList[shouldEnter ? 'add' : 'remove'](rb.statePrefix + 'in' + rb.nameSeparator + 'scrollrange');

                this.trigger();

                if (once == 'entered' || once && (!this.childs || !this.childs.length)) {
                    this.destroy();
                }
            }
        };

        Scrolly.prototype._setScrollinElement = function _setScrollinElement() {
            var oldScrollingEvtElement = this.scrollingEvtElement;

            if (this.options.scrollContainer) {
                this.scrollingElement = this.element.closest(this.options.scrollContainer);
            }

            if (!this.scrollingElement || !this.options.scrollContainer) {
                this.scrollingElement = rb.getPageScrollingElement();
            }

            this.scrollingEvtElement = this.scrollingElement.matches('html, body') ? window : this.scrollingElement;

            if (oldScrollingEvtElement) {
                oldScrollingEvtElement.removeEventListener('scroll', this.throtteldCheckPosition);
            }

            this.scrollingEvtElement.addEventListener('scroll', this.throtteldCheckPosition);
        };

        Scrolly.prototype.attached = function attached() {
            this.detached();
            this._setScrollinElement();

            rb.resize.on(this.reflow);
            clearInterval(this.layoutInterval);
            this.layoutInterval = setInterval(this.reflow, Math.round(9999 + 5000 * Math.random()));
        };

        Scrolly.prototype.detached = function detached() {
            if (this.scrollingEvtElement) {
                this.scrollingEvtElement.removeEventListener('scroll', this.throtteldCheckPosition);
            }
            rb.resize.off(this.reflow);
            clearInterval(this.layoutInterval);
        };

        return Scrolly;
    }(rb.components._childfx || rb.Component);

    Object.assign(Scrolly, {
        regWhite: /\s/g,
        regCalc: /(([+-]*\d+[.\d]*)(px|vh|eh|vw|ew))/g,
        knownUnits: { vh: 1, eh: 1, vw: 1, ew: 1 }
    });

    rb.live.register('scrolly', Scrolly);

    exports.default = Scrolly;
});
