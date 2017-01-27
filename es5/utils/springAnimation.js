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
    // aliases
    var rb = window.rb;
    var $ = rb.$;
    // const rAF = window.requestAnimationFrame;
    // const cAF = window.cancelAnimationFrame;

    // default options
    var defaults = {
        // spring and obj mass
        stiffness: 30,
        damping: 5,
        mass: 1,

        // start and end values
        from: null, // [number, object] { value, velocity }
        target: null,

        // keep alive thresholds
        accelerationThreshold: 25,

        // callbacks
        progress: $.noop,
        complete: $.noop,
        stop: $.noop
    };

    var SpringAnimation = function SpringAnimation(options) {
        if (!(this instanceof SpringAnimation)) {
            return new SpringAnimation(options);
        }

        var o = this.options = Object.assign({}, defaults, options);

        /* spring stiffness, in kg/s^2 */
        this.springStiffness = o.stiffness * -1; //k

        /* damping in kg/s */
        this.damping = o.damping * -1;

        this._update = this._update.bind(this);

        if (o.from === null) {
            rb.logError('Can not create springAnimation without start and end values');
            return;
        }

        this.currentValue = o.from.value || parseInt(o.from, 10) || 0;
        this.currentVelocity = o.from.velocity || 0;
        this.currentMass = o.mass || 1;

        this._targetValue = o.target || 0;

        this.averageFrameTime = 10;
        this.lastUpdate = Date.now();
        this.ended = false;

        // initial calls
        this.update();
    };

    Object.assign(SpringAnimation.prototype, {
        update: function update() {
            rb.rAFQueue(this._update, false, true);
        },
        _update: function _update() {
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
            var displacement = this.currentValue - this._targetValue;
            var forceSpring = this.springStiffness * displacement; // / 1000 / 1000
            var forceDamper = this.damping * this.currentVelocity; // / 1000

            // calc acceleration
            var acceleration = (forceSpring + forceDamper) / this.currentMass;

            // apply acceleration for passed time an update values
            // velocity in change per second
            this.currentVelocity = this.currentVelocity + acceleration * rate;
            this.currentValue = this.currentValue + this.currentVelocity * rate;
            this.lastUpdate = now;

            if (this.averageFrameTime >= 60) {
                rb.logWarn('SpringAnimation | frame rate is very low!');
            }

            this.options.progress(this.getProgressState());

            // rewrite keep alive, to forceSpring && acc
            if (Math.abs(acceleration) < this.options.accelerationThreshold && Math.abs(forceSpring) < 25) {
                this.finish();
            } else {
                this.update();
            }
        },
        getProgressState: function getProgressState() {
            return {
                currentValue: this.currentValue,
                currentVelocity: this.currentVelocity
            };
        },
        stop: function stop() {
            if (!this.ended) {
                this.options.stop(this.getProgressState());
            }
            this.ended = true;

            // logAverageElapsedTime();
        },
        finish: function finish() {
            var _this = this;

            this.ended = true;
            this.currentValue = this._targetValue;

            rb.rAFQueue(function () {
                _this.options.progress(_this.getProgressState());
                _this.options.complete(_this.getProgressState());
            }, false, true);
        }
    });

    // Chrome: ~17-18
    // Safari: ~17
    // FF: ~21
    // IE10: 32-75 (errorlike sometimes > 100)
    // IE11: 34-55  (errorlike sometimes 60 and > 150)
    // Edge: 21-47 (jumpy 60 alsmost errorlike also 80)
    // function logAverageElapsedTime(){
    // 	console.warn('... AVERAGE ELAPSED TIME:', timeElapsedTotal/timeElapsedUpdates, timeElapsedUpdates, timeElapsedTotal);
    // }

    rb.SpringAnimation = SpringAnimation;

    exports.default = SpringAnimation;
});
