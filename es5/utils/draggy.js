(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './css-supports', './get-id', './rafs'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./css-supports'), require('./get-id'), require('./rafs'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.cssSupports, global.getId, global.rafs);
        global.draggy = mod.exports;
    }
})(this, function (exports, _cssSupports, _getId, _rafs) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _cssSupports2 = _interopRequireDefault(_cssSupports);

    var _getId2 = _interopRequireDefault(_getId);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var rb = window.rb || {};
    var $ = rb.$;
    var noop = function noop() {};
    var btnsMap = {
        image: 1,
        file: 1,
        button: 1,
        submit: 1
    };

    var regInputs = /^(?:input|textarea)$/i;
    var supportsPointerWithoutTouch = window.PointerEvent && (!window.TouchEvent || !window.Touch || !window.TouchList);
    var supportsCssTouchActionPan = (0, _cssSupports2.default)('(touch-action: pan-y)') && (0, _cssSupports2.default)('(touch-action: none)');
    var supportsPassiveEventListener = !supportsPointerWithoutTouch && supportsCssTouchActionPan && function () {
        var supportsPassiveOption = false;
        var id = 'test' + (0, _getId2.default)();

        try {
            var opts = Object.defineProperty({}, 'passive', {
                get: function get() {
                    supportsPassiveOption = true;
                }
            });

            window.addEventListener(id, noop, opts);
            window.removeEventListener(id, noop, opts);
        } catch (e) {} // eslint-disable-line no-empty

        return supportsPassiveOption;
    }();
    var supportsTouchAction = supportsPassiveEventListener || supportsPointerWithoutTouch;
    var hasIOSScrollBug = function () {
        var ua = navigator.userAgent || '';
        var version = !supportsCssTouchActionPan && /Safari\/60\d\./.test(ua) && /Version\/10\.(\d+)/.exec(ua);

        return version && parseInt(version[1], 10) < 3;
    }();

    function Draggy(element, options) {
        var _this = this;

        this.element = element;
        this.options = Object.assign({}, Draggy._defaults, options);
        this.destroyed = false;

        this.noop = function () {};

        this.velocitySnapShot = this.velocitySnapShot.bind(this);

        (0, _rafs.rAFs)(this, { throttle: true }, 'setTouchAction');

        this.touchOpts = this.options.usePassiveEventListener && supportsTouchAction ? { passive: true } : false;

        this.reset();

        this.setupEvents();
        this.setTouchAction();

        if (this.options.useMouse) {
            this.setupMouse();
        }

        if (this.options.useTouch) {
            if (supportsPointerWithoutTouch) {
                this.setupPointer();
            } else {
                this.setupTouch();
            }
        }

        Draggy.constructs.forEach(function (construct) {
            construct.call(_this, _this.element, _this.options);
        });
    }

    Draggy._defaults = {
        move: noop,
        start: noop,
        end: noop,
        // set to false to allow only vertical drag
        horizontal: true,
        // set to true to allow only vertical drag
        vertical: true,
        // selector
        exclude: false,
        excludeNothing: false,
        //prevents mouse click, if a drag happend
        preventClick: true,
        //prevents touchMove events if currently dragging.
        preventMove: true,
        //allow drag by touch (includes pointer events)
        useTouch: true,
        //allow drag by mouse
        useMouse: true,
        //handle mouse events in pointer events, if false uses oldSchool mouseevents.
        usePointerMouse: false,
        // stops event propagation, improves nested drags
        stopPropagation: true,
        // uses passive event listener
        usePassiveEventListener: true,
        usePointerOnActive: false,
        // catches start also with with touchmove event instead of touchstart only.
        catchMove: false,
        // velocityBase moved pixel in 333
        velocityBase: 333
    };

    Draggy.constructs = [];
    Draggy.extend = function (defaults, construct, proto) {
        Draggy.constructs.push(construct);

        Object.entries(proto).forEach(function (_ref) {
            var name = _ref[0],
                prop = _ref[1];

            if (typeof Draggy.prototype[name] == 'function') {
                prop.superFn = Draggy.prototype[name];

                Draggy.prototype[name] = prop;
            } else {
                Draggy.prototype[name] = prop;
            }
        });

        Object.assign(Draggy._defaults, defaults);
    };

    Object.assign(Draggy.prototype, {
        setTouchAction: function setTouchAction() {
            var _options = this.options,
                usePointerOnActive = _options.usePointerOnActive,
                usePassiveEventListener = _options.usePassiveEventListener;


            if (!supportsTouchAction || !usePassiveEventListener && (!usePointerOnActive || !supportsPointerWithoutTouch)) {
                return;
            }

            var style = '';

            if (!this.destroyed) {
                if (!this.options.horizontal) {
                    style = 'pan-x';
                } else if (!this.options.vertical) {
                    style = 'pan-y';
                } else {
                    style = 'none';
                }
            }

            this.element.style.touchAction = style;
        },
        hasRelevantChange: function hasRelevantChange() {
            var horizontalDif = void 0,
                verticalDif = void 0;
            var options = this.options;
            var ret = true;

            if (options.horizontal != options.vertical) {
                horizontalDif = Math.abs(this.curPos.x - this.lastPos.x);
                verticalDif = Math.abs(this.curPos.y - this.lastPos.y);

                ret = options.horizontal && horizontalDif * 0.8 > verticalDif || options.vertical && verticalDif * 0.8 > horizontalDif;

                if (!ret && horizontalDif < 2 && verticalDif < 2) {
                    ret = 'undecided';
                }
            }

            return ret;
        },
        reset: function reset() {
            this.isType = '';
            this.technicalVelFactor = 1;
            this.isTechnicalType = '';
            this.startPos = {};
            this.lastPos = {};
            this.relPos = {};
            this.curPos = {};
            this.velTime = null;
            this.horizontalVel = 0;
            this.verticalVel = 0;
            this.allowClick = noop;
        },

        technicalVelFactor: 1,
        velocitySnapShot: function velocitySnapShot() {
            var velTiming = void 0;

            if (this.velTime) {
                velTiming = Date.now() - this.velTime;

                if (velTiming > 80 || !this.horizontalVel && !this.verticalVel) {
                    var velocityBase = this.options.velocityBase;


                    velTiming = (velTiming / velocityBase || 1) * (1 / this.technicalVelFactor);

                    this.velPos = this._velPos;

                    this.horizontalVelDir = this.curPos.x - this.velPos.x;
                    this.verticalVelDir = this.curPos.x - this.velPos.x;

                    this.horizontalVel = Math.abs(this.horizontalVelDir) || 0.00000001;
                    this.verticalVel = Math.abs(this.verticalVelDir) || 0.00000001;

                    this.verticalVel /= velTiming;
                    this.horizontalVel /= velTiming;
                }
            }

            this._velPos = this.curPos;
            this.velTime = Date.now();
        },
        start: function start(pos, evt) {
            var options = this.options;

            this.startPos = {
                x: 'draggyX' in pos ? pos.draggyX : pos.clientX,
                y: 'draggyY' in pos ? pos.draggyY : pos.clientY,
                pX: pos.pageX,
                pY: pos.pageY
            };
            this.movedPos = {
                x: 0,
                y: 0
            };
            this.curPos = this.startPos;

            this.relevantChange = false;

            if (options.stopPropagation) {
                evt.stopImmediatePropagation();
            }

            clearInterval(this._velocityTimer);
            this._velocityTimer = setInterval(this.velocitySnapShot, 200);
            this.velocitySnapShot();

            options.start(this, evt);
        },
        move: function move(pos, evt) {
            var options = this.options;

            this.lastPos = this.curPos;
            this.curPos = {
                x: 'draggyX' in pos ? pos.draggyX : pos.clientX,
                y: 'draggyY' in pos ? pos.draggyY : pos.clientY,
                pX: pos.pageX,
                pY: pos.pageY
            };

            if (this.relevantChange !== true && !(this.relevantChange = this.hasRelevantChange())) {
                this.end(pos, evt);
                return;
            }

            if (options.preventMove && this.relevantChange != 'undecided' && !supportsPassiveEventListener) {
                evt.preventDefault();
            }
            if (options.stopPropagation) {
                evt.stopImmediatePropagation();
            }

            this.movedPos.x = this.curPos.x - this.startPos.x;
            this.movedPos.y = this.curPos.y - this.startPos.y;
            this.relPos.x = this.curPos.x - this.lastPos.x;
            this.relPos.y = this.curPos.y - this.lastPos.y;

            options.move(this, evt);
        },
        end: function end(pos, evt) {
            var options = this.options;
            var preventClick = options.preventClick;

            clearInterval(this._velocityTimer);
            this.velocitySnapShot();

            this.allowClick = function () {
                preventClick = false;
            };

            if (this._destroyTouch) {
                this._destroyTouch();
            } else if (this._destroyPointer) {
                this._destroyPointer();
            }

            if (this._destroyMouse) {
                this._destroyMouse();
            }

            this.movedPos.x = this.curPos.x - this.startPos.x;
            this.movedPos.y = this.curPos.y - this.startPos.y;

            if (!('x' in this.relPos) && !('y' in this.lastPos)) {
                this.lastPos = this.curPos;
                this.relPos.x = this.curPos.x - this.lastPos.x;
                this.relPos.y = this.curPos.y - this.lastPos.y;
            }

            options.end(this, evt);

            if (Math.abs(this.lastPos.x - this.startPos.x) > 15 || Math.abs(this.lastPos.y - this.startPos.y) > 15) {
                if (options.stopPropagation) {
                    evt.stopImmediatePropagation();
                }
                if (preventClick) {
                    this.preventClick(evt);
                }
            }
            this.reset();
        },
        preventClick: function preventClick(evt) {
            var _this2 = this;

            this.isClickPrevented = true;
            clearTimeout(this._preventClickTimer);

            this._preventClickTimer = setTimeout(function () {
                _this2.isClickPrevented = false;
            }, 333);

            if (evt && evt.preventDefault && (!supportsPassiveEventListener || evt.type != 'touchend' && evt.type != 'pointerup')) {
                evt.preventDefault();
            }
        },
        setupEvents: function setupEvents() {
            var that = this;

            this._onclick = function (e) {
                if (that.isClickPrevented) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            };

            this._onSelectStart = function (e) {
                if (that.allowedDragTarget(e.target)) {
                    e.preventDefault();
                }
            };

            this.element.addEventListener('click', this._onclick, true);
            this.element.addEventListener('selectstart', this._onSelectStart, true);
        },

        allowedDragTarget: function allowedDragTarget(target) {
            var _options2 = this.options,
                excludeNothing = _options2.excludeNothing,
                exclude = _options2.exclude;

            return excludeNothing || btnsMap[target.type] || !regInputs.test(target.nodeName || '') && (!exclude || !target.closest(exclude));
        },
        isAllowedForType: function isAllowedForType(type) {
            return !this.isTechnicalType || this.isTechnicalType == type;
        },
        setupMouse: function setupMouse() {
            var _this3 = this;

            var timer = void 0;

            var move = function move(e) {
                if (!e.buttons && !e.which) {
                    up(e);
                    _this3._destroyMouse();
                    return;
                }
                _this3.move(e, e);
            };

            var up = function up(e) {
                _this3._destroyMouse();
                _this3.end(e, e);
            };

            this._destroyMouse = function () {
                clearTimeout(timer);
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            };

            this._onmousedown = function (e) {
                _this3._destroyMouse();
                if (e.defaultPrevented || e.button || !_this3.options.useMouse || !_this3.isAllowedForType('mouse') || !_this3.allowedDragTarget(e.target)) {
                    return;
                }

                if (e.target.nodeName != 'SELECT') {
                    e.preventDefault();
                }

                _this3.isType = 'mouse';
                _this3.isTechnicalType = 'mouse';

                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', up);

                _this3.start(e, e);
            };

            this.element.addEventListener('mousedown', this._onmousedown);
        },
        setupTouch: function setupTouch() {
            var _this4 = this;

            var identifier = void 0;
            var getTouch = function getTouch(touches) {
                var i = void 0,
                    len = void 0,
                    touch = void 0;

                for (i = 0, len = touches.length; i < len; i++) {
                    if (touches[i].identifier == identifier) {
                        touch = touches[i];
                        break;
                    }
                }

                return touch;
            };

            var move = function move(e) {
                var touch = getTouch(e.changedTouches || e.touches);

                if (touch) {
                    _this4.move(touch, e);
                }
            };

            var end = function end(e) {
                var touch = getTouch(e.changedTouches || e.touches);

                if (touch) {
                    _this4._destroyTouch();
                    _this4.end(touch, e);

                    if (_this4.options.catchMove) {
                        _this4.element.addEventListener('touchmove', _this4._ontouchstart, _this4.touchOpts);
                    }

                    identifier = undefined;
                }
            };

            if (!this._destroyTouch) {
                this._destroyTouch = function () {
                    _this4.element.removeEventListener('touchmove', move, _this4.touchOpts);
                    _this4.element.removeEventListener('touchend', end, _this4.touchOpts);
                    _this4.element.removeEventListener('touchcancel', end, _this4.touchOpts);
                };
            }

            if (!this._ontouchstart) {
                this._ontouchstart = function (e) {
                    if (e.touches.length != 1) {
                        return;
                    }

                    _this4._destroyTouch();

                    if (e.defaultPrevented || !_this4.options.useTouch || !_this4.isAllowedForType('touch') || !e.touches[0] || !_this4.allowedDragTarget(e.target)) {
                        return;
                    }

                    identifier = e.touches[0].identifier;

                    _this4.isType = 'touch';
                    _this4.isTechnicalType = 'touch';

                    _this4.element.addEventListener('touchmove', move, _this4.touchOpts);
                    _this4.element.addEventListener('touchend', end, _this4.touchOpts);
                    _this4.element.addEventListener('touchcancel', end, _this4.touchOpts);

                    if (_this4.options.catchMove) {
                        _this4.element.removeEventListener('touchmove', _this4._ontouchstart, _this4.touchOpts);
                    }

                    _this4.start(e.touches[0], e);
                };
            }

            this.element.addEventListener('touchstart', this._ontouchstart, this.touchOpts);

            if (hasIOSScrollBug) {
                window.addEventListener('touchmove', this.noop);
            }

            if (this.options.catchMove) {
                this.element.addEventListener('touchmove', this._ontouchstart, this.touchOpts);
            }
        },

        setupPointer: function setupPointer() {
            var _this5 = this;

            var identifier = void 0;
            var that = this;
            var options = this.options;

            var move = function move(e) {
                if (e.pointerId == identifier) {
                    _this5.move(e, e);
                }
            };

            var end = function end(e) {

                if (e.pointerId == identifier) {
                    _this5._destroyPointer();
                    _this5.end(e, e);
                }
            };

            this._destroyPointer = function () {
                identifier = undefined;
                document.removeEventListener('pointermove', move);
                document.removeEventListener('pointerup', end);
                document.removeEventListener('pointercancel', end);
            };

            this._pointerdown = this._pointerdown || function (e) {
                if (identifier) {
                    return;
                }

                var isMouse = e.pointerType == 'mouse';

                that._destroyPointer();

                if (e.defaultPrevented || e.isPrimary === false || isMouse && !options.useMouse || e.button || !options.useTouch || !this.isAllowedForType('pointer') || !that.allowedDragTarget(e.target)) {
                    return;
                }

                if (isMouse && !options.usePointerMouse) {
                    if (options.useMouse && options.stopPropagation) {
                        e.stopImmediatePropagation();
                    }
                    return;
                }

                if (e.target.nodeName != 'SELECT') {
                    e.preventDefault();
                }

                identifier = e.pointerId;

                that.isType = isMouse ? 'mouse' : 'touch';
                that.isTechnicalType = 'pointer';

                document.addEventListener('pointermove', move);
                document.addEventListener('pointerup', end);
                document.addEventListener('pointercancel', end);

                that.start(e, e);
            };

            this.element.addEventListener('pointerdown', this._pointerdown);
        },
        destroy: function destroy() {
            clearInterval(this._velocityTimer);
            this.destroyed = true;

            if (this._ontouchstart) {
                this.element.removeEventListener('touchstart', this._ontouchstart, this.touchOpts);
            }
            if (this._pointerdown) {
                this.element.removeEventListener('pointerdown', this._pointerdown);
            }

            if (this._onmousedown) {
                this.element.removeEventListener('mousedown', this._onmousedown);
            }

            if (hasIOSScrollBug) {
                window.removeEventListener('touchmove', this.noop);
            }

            this.element.removeEventListener('click', this._onclick, true);
            this.element.removeEventListener('selectstart', this._onSelectStart, true);
            this.setTouchAction();

            if (this.element._rbDraggy == this) {
                delete this.element._rbDraggy;
            }
        }
    });

    rb.Draggy = Draggy;

    if ($ && $.fn) {
        $.fn.draggy = function (options) {
            var draggy = void 0;

            this.each(function () {
                if (options == 'destroy') {
                    if (this._rbDraggy) {
                        this._rbDraggy.destroy();
                    }
                } else if (!this._rbDraggy) {
                    this._rbDraggy = new Draggy(this, options || {});
                }
                if (!draggy) {
                    draggy = this._rbDraggy;
                }
            });
            return draggy || this;
        };
    }

    exports.default = Draggy;
});
