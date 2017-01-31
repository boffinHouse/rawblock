// aliases
const rb = window.rb;
const $ = rb.$;
// const rAF = window.requestAnimationFrame;
// const cAF = window.cancelAnimationFrame;

class SpringAnimation {

    static get defaults() {
        return {
            // spring and obj mass
            stiffness: 30,
            damping: 5,
            mass: 1,

            // start and end values
            from: null, // [number, object] { value, velocity }
            target: null,

            // keep alive thresholds
            autostart: true, // TODO: implement this + start() callback
            accelerationThreshold: 25,

            // callbacks
            progress: $.noop,
            complete: $.noop,
            stop: $.noop
        };
    }

    constructor(options) {
        const o = this.options = Object.assign({}, SpringAnimation.defaults, options);

        /* spring stiffness, in kg/s^2 */
        this.stiffness = o.stiffness;

        /* damping in kg/s */
        this.damping = o.damping;

        this._update = this._update.bind(this);

        if (o.from === null) {
            rb.logError('Can not create springAnimation without start and end values');
            return;
        }

        this.currentValue = o.from.value || parseInt(o.from, 10) || 0;
        this.currentVelocity = o.from.velocity || 0;
        this.currentMass = o.mass || 1;

        this.target = o.target;

        this.averageFrameTime = 10;
        this.lastUpdate = Date.now();
        this.ended = false;

        // initial calls
        this.update();
    }

    get damping(){
        return this._damping * -1;
    }

    set damping(newValue){
        this._damping = Math.max(0.01, newValue) * -1;
    }

    set stiffness(newValue){
        this._stiffness = Math.max(0.1, newValue) * -1;
    }

    get stiffness(){
        return this._stiffness * -1;
    }

    get target(){
        return this._targetValue;
    }

    set target(newValue){
        this._targetValue = newValue || 0;

        if(this.ended && !this.shouldFinish()){
            this.ended = false;
            this.update();
        }
    }

    get currentDisplacement(){
        return this.currentValue - this._targetValue;
    }

    update() {
        rb.rAFQueue(this._update, false, true);
    }

    _update() {
        if (this.ended) {
            return;
        }

        const now = Date.now();

        // need to keep frame time in bounds (otherwise calcucations gets crazy)
        const timeElapsed = Math.max(10, Math.min(66.66, now - this.lastUpdate));

        // average frame time out, to get a smoother transition
        this.averageFrameTime = Math.round((2 * this.averageFrameTime + timeElapsed) / 3);

        const rate = (1 / 1000) * this.averageFrameTime;

        // calc spring and damper forces
        const _forceSpring = this._stiffness * this.currentDisplacement; // / 1000 / 1000
        const _forceDamper = this._damping * ( this.currentVelocity ); // / 1000

        // calc acceleration
        const acceleration = ( _forceSpring + _forceDamper ) / this.currentMass;

        // apply acceleration for passed time an update values
        // velocity in change per second
        this.currentVelocity = this.currentVelocity + (acceleration * rate);
        this.currentValue = this.currentValue + (this.currentVelocity * rate);
        this.lastUpdate = now;

        // detect oscillation by counting passing of target value back and forth, and then if detected increse damping

        if (this.averageFrameTime >= 60) {
            rb.logWarn('SpringAnimation | frame rate is very low!');
        }

        this.options.progress(this.getProgressState());

        if(this.shouldFinish()) {
            this.finish();
        } else {
            this.update();
        }
    }

    // TODO: rewrite keep alive, to forceSpring && acc && currentDisplacement, calc preci
    shouldFinish(){
        const shouldFinish = Math.abs(this.currentDisplacement) < 0.5 && Math.abs(this.currentVelocity) < 1;
        return shouldFinish;
    }

    getProgressState() {
        return {
            currentValue: this.currentValue,
            currentVelocity: this.currentVelocity
        };
    }

    stop() {
        if (!this.ended) {
            this.options.stop(this.getProgressState());
        }
        this.ended = true;
    }

    finish() {
        this.ended = true;
        this.currentValue = this._targetValue;

        rb.rAFQueue(() => {
            this.options.progress(this.getProgressState());
            this.options.complete(this.getProgressState());
        }, false, true);
    }
}

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

export default SpringAnimation;
