(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './draggy', './wheelintent', './wheelanalyzer', './debounce'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./draggy'), require('./wheelintent'), require('./wheelanalyzer'), require('./debounce'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.draggy, global.wheelintent, global.wheelanalyzer, global.debounce);
        global.draggy_wheel = mod.exports;
    }
})(this, function (exports, _draggy, _wheelintent, _wheelanalyzer, _debounce) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _draggy2 = _interopRequireDefault(_draggy);

    var _wheelintent2 = _interopRequireDefault(_wheelintent);

    var _wheelanalyzer2 = _interopRequireDefault(_wheelanalyzer);

    var _debounce2 = _interopRequireDefault(_debounce);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    _draggy2.default.extend({
        useWheel: false
    }, function (element, options) {
        var _this = this;

        if (!options.useWheel) {
            return;
        }

        this._wheelReset();

        ['wheelEnded', 'wheelHandler'].forEach(function (fn) {
            _this[fn] = _this[fn].bind(_this);
        });

        this.debouncedWheelEnded = (0, _debounce2.default)(this.wheelEnded, { delay: 99 });
        this.wheelDirEnded = (0, _debounce2.default)(this.wheelDirEnded, { delay: 88 });

        this.wheelAnalyzr = new _wheelanalyzer2.default();

        _wheelintent2.default.add(element, this.wheelHandler);

        this.wheelAnalyzr.subscribe('interrupted', this.wheelEnded).subscribe('ended', this.wheelEnded).subscribe('recognized', this.wheelEnded);
    }, {
        transformWheelEvent: function transformWheelEvent(_ref) {
            var clientX = _ref.clientX,
                clientY = _ref.clientY,
                pageX = _ref.pageX,
                pageY = _ref.pageY,
                deltaX = _ref.deltaX,
                deltaY = _ref.deltaY;

            return {
                draggyX: this.wheelPageX,
                draggyY: this.wheelPageY,
                pageX: pageX,
                pageY: pageY,
                clientX: clientX,
                clientY: clientY,
                deltaX: deltaX,
                deltaY: deltaY
            };
        },
        wheelEnded: function wheelEnded() {
            if (!this.isWheelEnded && this.isWheelStarted) {
                var e = this.lastWheelEvent;

                this.isWheelEnded = true;
                this.end(this.transformWheelEvent(e), e);
            }
        },
        wheelDirEnded: function wheelDirEnded() {
            this._wheelReset();
        },
        isAllowedWheelDir: function isAllowedWheelDir(e) {

            if (this._isAllowedWheelDir == 'undecided') {
                var _options = this.options,
                    horizontal = _options.horizontal,
                    vertical = _options.vertical;


                if (horizontal && vertical) {
                    this._isAllowedWheelDir = true;
                } else {
                    var x = Math.abs(e[vertical ? 'deltaY' : 'deltaX']);
                    var y = Math.abs(e[vertical ? 'deltaX' : 'deltaY']);

                    if (x != y) {
                        this._isAllowedWheelDir = x > y;
                    }
                }
            }

            if (!this._isAllowedWheelDir) {
                this.wheelDirEnded();
            }

            return this._isAllowedWheelDir;
        },
        wheelHandler: function wheelHandler(e) {
            if (e.deltaMode !== 0 || !this.isAllowedForType('wheel') || !this.isAllowedWheelDir(e)) {
                return;
            }

            this.lastWheelEvent = e;
            e.preventDefault();

            this.wheelAnalyzr.feedWheel(e);
            this.debouncedWheelEnded();

            if (this.wheelAnalyzr.isMomentum) {
                if (!this.isWheelEnded && this.isWheelStarted) {
                    this.wheelEnded();
                }
                return;
            }

            this.wheelPageX -= e.deltaX;
            this.wheelPageY -= e.deltaY;

            if (!this.isWheelStarted) {
                this.isWheelStarted = true;
                this.isType = 'wheel';
                this.isTechnicalType = 'wheel';
                this.technicalVelFactor = 0.65;

                this.start(this.transformWheelEvent(e), e);
            } else {
                this.move(this.transformWheelEvent(e), e);
            }
        },
        _wheelReset: function _wheelReset() {
            this.isWheelStarted = false;
            this.isWheelEnded = false;
            this.isWheelStarted = false;
            this._isAllowedWheelDir = 'undecided';
            this.wheelPageX = 0;
            this.wheelPageY = 0;
        },


        reset: function reset() {
            var ret = reset.superFn.apply(this, arguments);
            this._wheelReset();
            return ret;
        }
    });

    exports.default = _draggy2.default;
});
