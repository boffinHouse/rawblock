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

    const WHEELEVENTS_TO_MERGE = 2; // 2
    const WHEELEVENTS_TO_ANALAZE = 3;

    // const ABSDELTA_DECREASE_THRESHOLD = 3;

    var defaults = {
        isDebug: true
    };

    var WheelAnalyzer = function(options){
        if (!(this instanceof WheelAnalyzer)) {
            return new WheelAnalyzer(options);
        }

        this.isScrolling = false;
        this.isMomentum = false;
        this.isInterrupted = false;
        this.willEndSoon = false;
        this.scrollEndedTimeout = null;

        this.lastAbsDelta = Infinity;
        this.deltaVelocity = 0; // px per second
        this.deltaTotal = 0; // moved during this scroll interaction
        this.scrollPoints = [];
        this.scrollPointsToMerge = [];
        this.overallDecreasing = [];

        this.feedWheel = this._feedWheel.bind(this);

        // callback api
        this.onMomentumRecognized = $.Callbacks();
        this.onMomentumInterrupted = $.Callbacks();
        this.onMomentumEnded = $.Callbacks();

        this.options = Object.assign(defaults, options);
    };

    Object.assign(WheelAnalyzer.prototype, {

        _feedWheel: function(wheelEvents){
            var that = this;

            if(!wheelEvents){ return; }

            if(Array.isArray(wheelEvents)){
                wheelEvents.forEach(function(wheelEvent){
                    that._addWheelEvent(wheelEvent);
                });
            } else {
                this._addWheelEvent(wheelEvents);
            }
        },

        _addWheelEvent: function(e){
            var that = this;

            if(!this.isScrolling){
                this._beginScroll(e);
            }

            clearTimeout(this.scrollEndedTimeout);

            this.scrollEndedTimeout = setTimeout(function(){
                that._endScroll(e);
            }, 50);

            var currentDelta =  Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            var currentAbsDelta = Math.abs(currentDelta);

            if(e.deltaMode !== 0){
                if(this.options.isDebug) {
                    console.warn('deltaMode is not 0');
                }
                return;
            }

            if(currentAbsDelta > this.lastAbsDelta) {
                this._endScroll(e);
                this._beginScroll(e);
            }

            this.deltaTotal = this.deltaTotal + currentDelta;
            this.lastAbsDelta = currentAbsDelta;

            this.scrollPointsToMerge.push({
                currentDelta,
                currentAbsDelta,
                timestamp: e.timeStamp || Date.now()
            });

            if(this.scrollPointsToMerge.length === WHEELEVENTS_TO_MERGE){
                this.scrollPoints.push({
                    currentDelta: Math.round(this.scrollPointsToMerge.reduce((a,b) => a + b.currentDelta, 0) / WHEELEVENTS_TO_MERGE),
                    currentAbsDelta: Math.round(this.scrollPointsToMerge.reduce((a,b) => a + b.currentAbsDelta, 0) / WHEELEVENTS_TO_MERGE),
                    timestamp: Math.round(this.scrollPointsToMerge.reduce((a,b) => a + b.timestamp, 0) / WHEELEVENTS_TO_MERGE),
                });

                // reset merge array
                this.scrollPointsToMerge.length = 0;

                if(this.scrollPoints.length > WHEELEVENTS_TO_ANALAZE) {
                    this.updateVelocity();

                    // check if momentum can be recognized
                    if(!this.isMomentum && this._checkForMomentum()) {
                        this.onMomentumRecognized.fireWith(this, this.getCurrentState());
                    } else if(this.isMomentum) {
                        this._checkForEnding();
                    }
                }
            }
        },

        getCurrentState: function(){
            return {
                willEndSoon: this.willEndSoon,
                isScrolling: this.isScrolling,
                isMomentum: this.isMomentum,
                isInterrupted: this.isInterrupted,
                deltaVelocity: this.deltaVelocity,
                deltaTotal: this.deltaTotal,
            };
        },

        _beginScroll: function(){
            this.willEndSoon = false;
            this.isScrolling = true;
            this.isMomentum = false;
            this.isInterrupted = false;
            this.lastAbsDelta = Infinity;
            this.deltaVelocity = 0;
            this.deltaTotal = 0;
            this.scrollPoints = [];
            this.overallDecreasing.length = 0;
            this.scrollPointsToMerge.length = 0;
        },

        _endScroll: function(e){
            if(this.isMomentum){
                this.isMomentum = false;
                this._momentumEnded(e);
            }

            this.isScrolling = false;
        },

        _momentumEnded: function(){
            if(!this.willEndSoon){
                this.isInterrupted = true;
                this.onMomentumInterrupted.fireWith(this, this.getCurrentState());
            } else {
                this.onMomentumEnded.fireWith(this, this.getCurrentState());
            }
        },

        updateVelocity: function(){
            let scrollPointsToAnalize = this.scrollPoints.slice(WHEELEVENTS_TO_ANALAZE * -1);

            let totalDelta = scrollPointsToAnalize.reduce((a,b) => a + b.currentDelta, 0);
            let timePassedInInterval = Math.abs(scrollPointsToAnalize[scrollPointsToAnalize.length - 1].timestamp - scrollPointsToAnalize[0].timestamp);
            let currentVelocity = totalDelta / (timePassedInInterval || 1) * 1000;

            this.deltaVelocity = this.deltaVelocity ? (currentVelocity * 0.8 + this.deltaVelocity * 0.2) : currentVelocity;
        },

        _checkForMomentum: function(){
            if(this.isMomentum){
                return this.isMomentum;
            }

            // get the latest WHEELEVENTS_TO_ANALAZE
            let scrollPointsToAnalize = this.scrollPoints.slice(WHEELEVENTS_TO_ANALAZE * -1);
            let scrollPointsToAnalizeAbsDeltas = scrollPointsToAnalize.map((scrollPoint)=>scrollPoint.currentAbsDelta);

            if(scrollPointsToAnalize.length < WHEELEVENTS_TO_ANALAZE){
                return console.error('not enough points.');
            }

            // check if delta is all decreasing
            let absDeltasMin = Math.min.apply(null, scrollPointsToAnalizeAbsDeltas);
            let absDeltasMax = Math.max.apply(null, scrollPointsToAnalizeAbsDeltas);
            let isOverallDecreasing = absDeltasMin < absDeltasMax && absDeltasMin === scrollPointsToAnalizeAbsDeltas[scrollPointsToAnalizeAbsDeltas.length - 1];

            this.overallDecreasing.push(isOverallDecreasing);

            if(this._checkDecreases(this.overallDecreasing)){
                this.isMomentum = true;
            }

            return this.isMomentum;
        },

        _checkForEnding: function(){
            let scrollPointsToAnalize = this.scrollPoints.slice(WHEELEVENTS_TO_ANALAZE * -1);
            let scrollPointsToAnalizeAbsDeltas = scrollPointsToAnalize.map((scrollPoint)=>scrollPoint.currentAbsDelta);
            let absDeltaAvrg = scrollPointsToAnalizeAbsDeltas.reduce((a,b) => a+b) / scrollPointsToAnalizeAbsDeltas.length;

            if(absDeltaAvrg < 1.3){
                this.willEndSoon = true;
            }

            return this.willEndSoon;
        },

        _checkDecreases: function(decreaseBooleans){
            let decreaseBooleansToCheck = decreaseBooleans.slice(-3);
            if(decreaseBooleansToCheck.length < 3){
                return false;
            }
            return decreaseBooleansToCheck.reduce((a,b) => a && b);
        }
    });

    rb.WheelAnalyzer = WheelAnalyzer;

    return WheelAnalyzer;
}));
