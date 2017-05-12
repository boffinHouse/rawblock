import rAFQueue from './rafqueue';
import addLog from './add-log';
import deferred from './deferred';

// aliases
const rb = window.rb || {};
const min = Math.min;
const max = Math.max;
const noop = ()=>{};

const AFTER_OSCILLATION_STIFFNESS = 170;
const AFTER_OSCILLATION_DAMPING = 5;

/**
 * SpringAnimation Class
 * for more realistic animations
 *
 * - takes value + velocity (optional) as from value
 * - configure stiffness, damping (and mass)
 * - use progress callback
 */
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
            keepAlivePrecision: SpringAnimation.PRECISION.LOW,

            // callbacks
            progress: noop,
            complete: noop,
            stop: noop,

            // debug
            debug: 'inherit',
        };
    }

    static get PRECISION() {
        return {
            HIGH: 0.001, // use for calculations that require more precisions (0..1)
            LOW: 0.4, // used for normal animations (pixel precision)
        };
    }

    constructor(options) {
        const o = this.options = Object.assign({}, SpringAnimation.defaults, options);

        addLog(this, this.options.debug === 'inherit' ? rb.isDebug : this.options.debug);

        // spring stiffness, in kg/s^2
        this.stiffness = o.stiffness;
        this.damping = o.damping; // damping in kg/s
        this.mass = o.mass; // in kg

        this._update = this._update.bind(this);

        if (o.from == null) {
            this.logError('Can not create springAnimation without start and end values');
            return;
        }

        this.oscillationCount = 0;
        this.oscillationDetected = false;
        this.currentValue = o.from.value || parseFloat(o.from) || 0;
        this.currentVelocity = o.from.velocity || 0;

        this.target = o.target;

        this.averageFrameTime = 10;
        this.lastUpdate = Date.now();
        this.ended = false;
        this.promise = deferred();

        // initial calls
        this.update();
    }

    get damping(){
        return this._damping * -1;
    }

    set damping(newValue){
        this._damping = Math.abs(newValue) * -1;
    }

    set stiffness(newValue){
        this._stiffness = Math.abs(newValue) * -1;
    }

    get stiffness(){
        return this._stiffness * -1;
    }

    get mass(){
        return this._mass;
    }

    set mass(newValue){
        this._mass = Math.abs(newValue) || 1;
    }

    get target(){
        return this._targetValue;
    }

    set target(newValue){
        this._targetValue = newValue || 0;

        if(this.ended && !this.shouldFinish()){
            this.ended = false;
            if(this.promise.isDone){
                this.promise = deferred();
            }
            this.update();
        }
    }

    get currentDisplacement(){
        return this.currentValue - this._targetValue;
    }

    update() {
        rAFQueue(this._update, false, true);
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
        const currentDisplacement = this.currentDisplacement;
        const _forceSpring = this._stiffness * currentDisplacement; // / 1000 / 1000
        const _forceDamper = this._damping * ( this.currentVelocity ); // / 1000

        // calc acceleration
        const acceleration = ( _forceSpring + _forceDamper ) / this.mass;

        // apply acceleration for passed time an update values
        // velocity in change per second
        this.currentVelocity = this.currentVelocity + (acceleration * rate);
        this.currentVelocity = min(Number.MAX_SAFE_INTEGER, max(Number.MIN_SAFE_INTEGER, this.currentVelocity));

        this.currentValue = this.currentValue + (this.currentVelocity * rate);
        this.currentValue = min(Number.MAX_SAFE_INTEGER, max(Number.MIN_SAFE_INTEGER, this.currentValue));
        this.lastUpdate = now;

        // detect oscillation by counting passing of target value back and forth
        if(!this.oscillationDetected && (currentDisplacement > 0) !== (this.currentDisplacement > 0)){
            this.oscillationCount += 1;

            if(this.oscillationCount === 30){
                this.oscillationDetected = true;
                this.logWarn(
                    'SpringAnimation | oscillation detected, adjust your stiffness and damping',
                    { stiffness: this.stiffness, damping: this.damping },
                    'or turn oscillationDetection off')
                ;
            }
        }

        // adjust spring on oscillationDetected
        if(this.oscillationDetected){
            this.stiffness = this.stiffness - ((this.stiffness - AFTER_OSCILLATION_STIFFNESS) / 1000);
            this.damping = this.damping - ((this.damping - AFTER_OSCILLATION_DAMPING) / 1000);
        }

        if (this.averageFrameTime >= 60) {
            this.logWarn('SpringAnimation | frame rate is very low!');
        }

        this.options.progress(this.getProgressState());

        if(this.shouldFinish()) {
            this.finish();
        } else {
            this.update();
        }
    }

    shouldFinish(){
        const keepAlivePrecision = this.options.keepAlivePrecision;
        return Math.abs(this.currentDisplacement) <= keepAlivePrecision && Math.abs(this.currentVelocity) <= keepAlivePrecision;
    }

    getProgressState() {
        return {
            currentValue: this.currentValue,
            currentVelocity: this.currentVelocity,
        };
    }

    stop() {
        if (!this.ended) {
            this.options.stop(this.getProgressState());
            this.promise.reject(this);
        }
        this.ended = true;
    }

    finish() {
        this.ended = true;
        this.currentValue = this._targetValue;
        this.promise.resolve(this);

        rAFQueue(() => {
            this.options.progress(this.getProgressState());
            this.options.complete(this.getProgressState());
        }, false, true);
    }
}

rb.SpringAnimation = SpringAnimation;

export default SpringAnimation;
