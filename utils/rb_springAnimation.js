const rb = window.rb;
const $ = rb.$;
const rAF = window.requestAnimationFrame;
const cAF = window.cancelAnimationFrame;

// default options
const defaults = {
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
    stop: $.noop,
};

const SpringAnimation = function(options){
    if (!(this instanceof SpringAnimation)) {
        return new SpringAnimation(options);
    }

    const o = this.options = Object.assign(defaults, options);

    /* spring stiffness, in kg/s^2 */
    this.springStiffness = o.stiffness * -1; //k

    /* damping in kg/s */
    this.damping = o.damping * -1;

    this._update = this._update.bind(this);

    if(o.from === null){
        rb.logError('Can not create springAnimation without start and end values');
        return;
    }

    this.currentValue = o.from.value || parseInt(o.from, 10) || 0;
    this.currentVelocity = o.from.velocity || 0;
    this.currentMass = o.mass || 1;

    this.targetValue = o.target || 0;

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
        const now = Date.now();
        const timeElasped = (now - this.lastUpdate + 1);
        const rate = (1/1000) * timeElasped;

        // calc spring and damper forces
        const displacement = this.currentValue - this.targetValue;
        const forceSpring = this.springStiffness * displacement; // / 1000 / 1000
        const forceDamper = this.damping * ( this.currentVelocity ); // / 1000

        // calc acceleration
        const acceleration = ( forceSpring + forceDamper ) / this.currentMass;

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
            velocity: this.velocity,
        };
    },
    stop: function(){
        cAF(this.updateAF);
        this.options.stop(this.getProgressState());
    },
});

rb.SpringAnimation = SpringAnimation;

export default SpringAnimation;
