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
        global.springAnimation = mod.exports;
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

    // aliases
    var rb = window.rb;
    var $ = rb.$;
    var min = Math.min;
    var max = Math.max;

    var AFTER_OSCILLATION_STIFFNESS = 170;
    var AFTER_OSCILLATION_DAMPING = 5;

    /**
     * SpringAnimation Class
     * for more realistic animations
     *
     * - takes value + velocity (optional) as from value
     * - configure stiffness, damping (and mass)
     * - use progress callback
     */

    var SpringAnimation = function () {
        _createClass(SpringAnimation, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    // spring and obj mass
                    stiffness: 30,
                    damping: 5,
                    mass: 1,

                    // start and end values
                    from: null, // [number, object] { value, velocity }
                    target: null,

                    // keep alive thresholds
                    keepAlivePrecision: SpringAnimation.PRECISION.LOW,

                    // callbacks
                    progress: $.noop,
                    complete: $.noop,
                    stop: $.noop,

                    // debug
                    debug: 'inherit'
                };
            }
        }, {
            key: 'PRECISION',
            get: function get() {
                return {
                    HIGH: 0.001, // use for calculations that require more precisions (0..1)
                    LOW: 0.4 };
            }
        }]);

        function SpringAnimation(options) {
            _classCallCheck(this, SpringAnimation);

            var o = this.options = Object.assign({}, SpringAnimation.defaults, options);

            rb.addLog(this, this.options.debug === 'inherit' ? rb.isDebug : this.options.debug);

            // spring stiffness, in kg/s^2
            this.stiffness = o.stiffness;
            this.damping = o.damping; // damping in kg/s
            this.mass = o.mass; // in kg

            this._update = this._update.bind(this);

            if (o.from === null) {
                rb.logError('Can not create springAnimation without start and end values');
                return;
            }

            this.oscillationCount = 0;
            this.oscillationDetected = false;
            this.currentValue = o.from.value || parseInt(o.from, 10) || 0;
            this.currentVelocity = o.from.velocity || 0;

            this.target = o.target;

            this.averageFrameTime = 10;
            this.lastUpdate = Date.now();
            this.ended = false;

            // initial calls
            this.update();
        }

        SpringAnimation.prototype.update = function update() {
            rb.rAFQueue(this._update, false, true);
        };

        SpringAnimation.prototype._update = function _update() {
            if (this.ended) {
                return;
            }

            var now = Date.now();

            // need to keep frame time in bounds (otherwise calcucations gets crazy)
            var timeElapsed = Math.max(10, Math.min(66.66, now - this.lastUpdate));

            // average frame time out, to get a smoother transition
            this.averageFrameTime = Math.round((2 * this.averageFrameTime + timeElapsed) / 3);

            var rate = 1 / 1000 * this.averageFrameTime;

            // calc spring and damper forces
            var currentDisplacement = this.currentDisplacement;
            var _forceSpring = this._stiffness * currentDisplacement; // / 1000 / 1000
            var _forceDamper = this._damping * this.currentVelocity; // / 1000

            // calc acceleration
            var acceleration = (_forceSpring + _forceDamper) / this.mass;

            // apply acceleration for passed time an update values
            // velocity in change per second
            this.currentVelocity = this.currentVelocity + acceleration * rate;
            this.currentVelocity = min(Number.MAX_SAFE_INTEGER, max(Number.MIN_SAFE_INTEGER, this.currentVelocity));

            this.currentValue = this.currentValue + this.currentVelocity * rate;
            this.currentValue = min(Number.MAX_SAFE_INTEGER, max(Number.MIN_SAFE_INTEGER, this.currentValue));
            this.lastUpdate = now;

            // detect oscillation by counting passing of target value back and forth
            if (!this.oscillationDetected && currentDisplacement > 0 !== this.currentDisplacement > 0) {
                this.oscillationCount += 1;

                if (this.oscillationCount === 30) {
                    this.oscillationDetected = true;
                    this.logWarn('SpringAnimation | oscillation detected, adjust your stiffness and damping', { stiffness: this.stiffness, damping: this.damping }, 'or turn oscillationDetection off');
                }
            }

            // adjust spring on oscillationDetected
            if (this.oscillationDetected) {
                this.stiffness = this.stiffness - (this.stiffness - AFTER_OSCILLATION_STIFFNESS) / 1000;
                this.damping = this.damping - (this.damping - AFTER_OSCILLATION_DAMPING) / 1000;
            }

            if (this.averageFrameTime >= 60) {
                this.logWarn('SpringAnimation | frame rate is very low!');
            }

            this.options.progress(this.getProgressState());

            if (this.shouldFinish()) {
                this.finish();
            } else {
                this.update();
            }
        };

        SpringAnimation.prototype.shouldFinish = function shouldFinish() {
            var keepAlivePrecision = this.options.keepAlivePrecision;
            return Math.abs(this.currentDisplacement) <= keepAlivePrecision && Math.abs(this.currentVelocity) <= keepAlivePrecision;
        };

        SpringAnimation.prototype.getProgressState = function getProgressState() {
            return {
                currentValue: this.currentValue,
                currentVelocity: this.currentVelocity
            };
        };

        SpringAnimation.prototype.stop = function stop() {
            if (!this.ended) {
                this.options.stop(this.getProgressState());
            }
            this.ended = true;
        };

        SpringAnimation.prototype.finish = function finish() {
            var _this = this;

            this.ended = true;
            this.currentValue = this._targetValue;

            rb.rAFQueue(function () {
                _this.options.progress(_this.getProgressState());
                _this.options.complete(_this.getProgressState());
            }, false, true);
        };

        _createClass(SpringAnimation, [{
            key: 'damping',
            get: function get() {
                return this._damping * -1;
            },
            set: function set(newValue) {
                this._damping = Math.abs(newValue) * -1;
            }
        }, {
            key: 'stiffness',
            set: function set(newValue) {
                this._stiffness = Math.abs(newValue) * -1;
            },
            get: function get() {
                return this._stiffness * -1;
            }
        }, {
            key: 'mass',
            get: function get() {
                return this._mass;
            },
            set: function set(newValue) {
                this._mass = Math.abs(newValue) || 1;
            }
        }, {
            key: 'target',
            get: function get() {
                return this._targetValue;
            },
            set: function set(newValue) {
                this._targetValue = newValue || 0;

                if (this.ended && !this.shouldFinish()) {
                    this.ended = false;
                    this.update();
                }
            }
        }, {
            key: 'currentDisplacement',
            get: function get() {
                return this.currentValue - this._targetValue;
            }
        }]);

        return SpringAnimation;
    }();

    rb.SpringAnimation = SpringAnimation;

    exports.default = SpringAnimation;
});
