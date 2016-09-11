(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';

    // aliases
    var rb = window.rb;
    var $ = rb.$;
    var rAF = window.requestAnimationFrame;
    var cAF = window.cancelAnimationFrame;

    // default options
    var defaults = {
        // spring and obj mass
        stiffness: 30,
        damping: 5,
        mass: 1,

        // start and end values
        from: null, // [number, object] { value, velocity }
        target: null,

        // callbacks
        progress: $.noop,
        complete: $.noop,
        stop: $.noop
    };

    var SpringAnimation = function(options){
        if (!(this instanceof SpringAnimation)) {
            return new SpringAnimation(options);
        }

        var o = this.options = Object.assign(defaults, options);

        /* spring stiffness, in kg/s^2 */
        this.springStiffness = o.stiffness * -1; //k

        /* damping in kg/s */
        this.damping = o.damping * -1;

        this._update = this._update.bind(this);

        if(o.from === null){
            rb.logError('Can not create springAnimation without start and end values');
            return;
        }

        this.currentValue = o.from.value || o.from || 0;
        this.currentVelocity = o.from.velocity || 0;
        this.currentMass = o.mass || 1;

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
            var timeElasped = (now - this.lastUpdate + 1);
            var rate = (1/1000) * timeElasped;

            // calc spring and damper forces
            var displacement = this.currentValue - this.targetValue;
            var forceSpring = this.springStiffness * displacement; // / 1000 / 1000
            var forceDamper = this.damping * ( this.currentVelocity ); // / 1000

            // calc acceleration
            var acceleration = ( forceSpring + forceDamper ) / this.currentMass;

            // apply acceleration for passed time an update values
            // velocity in change per second
            this.currentVelocity = this.currentVelocity + (acceleration * rate);
            this.currentValue = this.currentValue + (this.currentVelocity * rate);
            this.lastUpdate = now;

            this.options.progress(this.getProgressState());

            if(Math.abs(displacement) <= 0.5 && Math.abs(this.currentVelocity) <= 0.5){
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
