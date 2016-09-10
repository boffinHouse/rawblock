(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    var rb = window.rb;
    var $ = rb.$;

    var rAF = window.requestAnimationFrame;
    var cAF = window.cancelAnimationFrame;


    var defaults = {
        stiffness: 30,
        damping: 5,
        mass: 1,
        from: null,
        target: null,
        progress: $.noop,
        complete: $.noop,
        stop: $.noop
    };

    var SpringAnimation = function(options){
        if (!(this instanceof SpringAnimation)) {
            return new SpringAnimation(options);
        }

        var o;

        this.options = Object.assign(defaults, options);

        o = this.options;

        /* spring stiffness, in kg/s^2 */
        this.springStiffness = -200; //k
        this.springLength = 0;

        /* damping in kg/s */
        this.damping = -90;

        this._update = this._update.bind(this);

        if(o.from === null){
            rb.logError('Can not create springAnimation without start and end values');
            return;
        }

        this.currentValue = o.from.value || o.from || 0;
        this.currentVelocity = o.from.velocity || 0;
        this.currentMass = 1 || o.mass || defaults.mass;

        this.targetValue = o.target || 0;

        this.lastUpdate = Date.now();
        this.ended = false;

        // initial calls
        this.update();
    };

    Object.assign(SpringAnimation.prototype, {
        update: function(){
            this.updateAF = rAF(this._update);
        },
        _update: function(){
            var now = Date.now();
            var timeElaspedMs = (now - this.lastUpdate + 1);
            var timeElaspedSec = timeElaspedMs / 1000; // in sec

            // calc spring and damper forces
            var displacement = this.currentValue - this.targetValue;
            var forceSpring = this.springStiffness * displacement; // / 1000 / 1000
            var forceDamper = this.damping * ( this.currentVelocity ); // / 1000

            // calc acceleration
            var acceleration = ( forceSpring + forceDamper ) / this.currentMass * (1/timeElaspedMs);

            // apply acceleration for passed time an update values
            // velocity in change per second
            this.currentVelocity = this.currentVelocity + (acceleration * timeElaspedSec);
            this.currentValue = this.currentValue + (this.currentVelocity * timeElaspedSec);
            this.lastUpdate = now;

            // console.log('springUpdate');
            // console.log({ timeElaspedMs, displacement });
            // console.log('value   ', this.currentValue);
            // console.log('velocity', this.currentVelocity);

            this.options.progress(this.getProgressState());

            if(Math.abs(displacement) <= 0.5 && Math.abs(this.currentVelocity) <= 0.5){
                console.log('COMPLETE', this);
                this.options.complete(this.getProgressState());
            } else {
                this.update();
            }
        },
        getProgressState: function(){
            return {
                currentValue: this.currentValue,
                velocity: this.velocity
            };
        },
        stop: function(){
            cAF(this.updateAF);
            this.options.stop(this.getProgressState());
        }
    });

    rb.SpringAnimation = SpringAnimation;

    return SpringAnimation;
}));
