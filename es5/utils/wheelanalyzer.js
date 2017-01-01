(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './pubsub', './debounce'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./pubsub'), require('./debounce'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.pubsub, global.debounce);
        global.wheelanalyzer = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });


    var rb = window.rb;

    var WHEELEVENTS_TO_MERGE = 2; // 2
    var WHEELEVENTS_TO_ANALAZE = 3;

    // var ABSDELTA_DECREASE_THRESHOLD = 3;

    var defaults = {
        isDebug: true
    };

    var WheelAnalyzer = function WheelAnalyzer(options) {
        if (!(this instanceof WheelAnalyzer)) {
            return new WheelAnalyzer(options);
        }

        this.isScrolling = false;
        this.isMomentum = false;
        this.isInterrupted = false;
        this.willEndSoon = false;

        this.lastAbsDelta = Infinity;
        this.deltaVelocity = 0; // px per second
        this.deltaTotal = 0; // moved during this scroll interaction
        this.scrollPoints = [];
        this.scrollPointsToMerge = [];
        this.overallDecreasing = [];

        this._debouncedEndScroll = rb.debounce(this._endScroll, { delay: 50 });

        // callback api
        rb.createPubSub(this);

        this.options = Object.assign(defaults, options);
    };

    Object.assign(WheelAnalyzer.prototype, {

        feedWheel: function feedWheel(wheelEvents) {
            var that = this;

            if (!wheelEvents) {
                return;
            }

            if (Array.isArray(wheelEvents)) {
                wheelEvents.forEach(function (wheelEvent) {
                    that._addWheelEvent(wheelEvent);
                });
            } else {
                this._addWheelEvent(wheelEvents);
            }
        },

        _addWheelEvent: function _addWheelEvent(e) {
            if (!this.isScrolling) {
                this._beginScroll(e);
            }

            this._debouncedEndScroll(e);

            var currentDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            var currentAbsDelta = Math.abs(currentDelta);

            if (e.deltaMode !== 0) {
                if (this.options.isDebug) {
                    rb.logWarn('deltaMode is not 0');
                }
                return;
            }

            if (currentAbsDelta > this.lastAbsDelta) {
                this._endScroll(e);
                this._beginScroll(e);
            }

            this.deltaTotal = this.deltaTotal + currentDelta;
            this.lastAbsDelta = currentAbsDelta;

            this.scrollPointsToMerge.push({
                currentDelta: currentDelta,
                currentAbsDelta: currentAbsDelta,
                timestamp: e.timeStamp || Date.now()
            });

            if (this.scrollPointsToMerge.length === WHEELEVENTS_TO_MERGE) {
                this.scrollPoints.push({
                    currentDelta: Math.round(this.scrollPointsToMerge.reduce(function (a, b) {
                        return a + b.currentDelta;
                    }, 0) / WHEELEVENTS_TO_MERGE),
                    currentAbsDelta: Math.round(this.scrollPointsToMerge.reduce(function (a, b) {
                        return a + b.currentAbsDelta;
                    }, 0) / WHEELEVENTS_TO_MERGE),
                    timestamp: Math.round(this.scrollPointsToMerge.reduce(function (a, b) {
                        return a + b.timestamp;
                    }, 0) / WHEELEVENTS_TO_MERGE)
                });

                // reset merge array
                this.scrollPointsToMerge.length = 0;

                if (this.scrollPoints.length > WHEELEVENTS_TO_ANALAZE) {
                    this.updateVelocity();

                    // check if momentum can be recognized
                    if (!this.isMomentum && this._checkForMomentum()) {
                        this.publish('recognized', this.getCurrentState());
                        //this.onMomentumRecognized.fireWith(this, this.getCurrentState());
                    } else if (this.isMomentum) {
                        this._checkForEnding();
                    }
                }
            }
        },

        getCurrentState: function getCurrentState() {
            return {
                willEndSoon: this.willEndSoon,
                isScrolling: this.isScrolling,
                isMomentum: this.isMomentum,
                isInterrupted: this.isInterrupted,
                deltaVelocity: this.deltaVelocity,
                deltaTotal: this.deltaTotal
            };
        },

        _beginScroll: function _beginScroll() {
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

        _endScroll: function _endScroll(e) {
            if (this.isMomentum) {
                this.isMomentum = false;
                this._momentumEnded(e);
            }

            this.isScrolling = false;
        },

        _momentumEnded: function _momentumEnded() {
            if (!this.willEndSoon) {
                this.isInterrupted = true;
                this.publish('interrupted', this.getCurrentState());
            } else {
                this.publish('ended', this.getCurrentState());
            }
        },

        updateVelocity: function updateVelocity() {
            var scrollPointsToAnalyze = this.scrollPoints.slice(WHEELEVENTS_TO_ANALAZE * -1);

            var totalDelta = scrollPointsToAnalyze.reduce(function (a, b) {
                return a + b.currentDelta;
            }, 0);

            var timePassedInInterval = Math.abs(scrollPointsToAnalyze[scrollPointsToAnalyze.length - 1].timestamp - scrollPointsToAnalyze[0].timestamp);
            var currentVelocity = totalDelta / (timePassedInInterval || 1) * 1000;

            this.deltaVelocity = this.deltaVelocity ? currentVelocity * 0.8 + this.deltaVelocity * 0.2 : currentVelocity;
        },

        _checkForMomentum: function _checkForMomentum() {
            if (this.isMomentum) {
                return this.isMomentum;
            }

            // get the latest WHEELEVENTS_TO_ANALAZE
            var scrollPointsToAnalize = this.scrollPoints.slice(WHEELEVENTS_TO_ANALAZE * -1);
            var scrollPointsToAnalizeAbsDeltas = scrollPointsToAnalize.map(function (scrollPoint) {
                return scrollPoint.currentAbsDelta;
            });

            if (scrollPointsToAnalize.length < WHEELEVENTS_TO_ANALAZE) {
                return rb.logError('not enough points.');
            }

            // check if delta is all decreasing
            var absDeltasMin = Math.min.apply(null, scrollPointsToAnalizeAbsDeltas);
            var absDeltasMax = Math.max.apply(null, scrollPointsToAnalizeAbsDeltas);
            var isOverallDecreasing = absDeltasMin < absDeltasMax && absDeltasMin === scrollPointsToAnalizeAbsDeltas[scrollPointsToAnalizeAbsDeltas.length - 1];

            this.overallDecreasing.push(isOverallDecreasing);

            if (this._checkDecreases(this.overallDecreasing)) {
                this.isMomentum = true;
            }

            return this.isMomentum;
        },

        _checkForEnding: function _checkForEnding() {
            var scrollPointsToAnalize = this.scrollPoints.slice(WHEELEVENTS_TO_ANALAZE * -1);
            var scrollPointsToAnalizeAbsDeltas = scrollPointsToAnalize.map(function (scrollPoint) {
                return scrollPoint.currentAbsDelta;
            });
            var absDeltaAvrg = scrollPointsToAnalizeAbsDeltas.reduce(function (a, b) {
                return a + b;
            }) / scrollPointsToAnalizeAbsDeltas.length;

            if (absDeltaAvrg < 1.3) {
                this.willEndSoon = true;
            }

            return this.willEndSoon;
        },
        _checkDecreases: function _checkDecreases(decreaseBooleans) {
            var decreaseBooleansToCheck = decreaseBooleans.slice(-3);

            if (decreaseBooleansToCheck.length < 3) {
                return false;
            }
            return decreaseBooleansToCheck.reduce(function (a, b) {
                return a && b;
            });
        }
    });

    rb.WheelAnalyzer = WheelAnalyzer;

    exports.default = WheelAnalyzer;
});
