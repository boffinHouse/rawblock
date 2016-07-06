(function(){
    "use strict";

    // var wheelMomentumAnalizer = WheelMomentumAnalizer();
    // wheelMomentumAnalizer.feedWheel(e); //org. wheel event

    // wheelMomentumAnalizer.isMomentum;
    // wheelMomentumAnalizer.wasIterrupted;

    // const WHEELEVENTS_TO_MERGE = 2;
    // const WHEELEVENTS_TO_ANALAZE = 3;
    // const ABSDELTA_DECREASE_THRESHOLD = 3;

     // this.onslide = $.Callbacks();

    //drawing
    var canvas = document.querySelector('canvas') || document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    // var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;

    var rAF = window.requestAnimationFrame;
    var cAF = window.cancelAnimationFrame;

    //scrolling
    var isScrolling = false;
    var isMomentum = false;
    var willEndSoon = false;
    var currentScrollStartedAt = 0;

    var scrollEndedTimeout;
    var scrollEndedAF;

    var lastAbsDelta = Infinity;
    var scrollPoints = [];
    var scrollPointsToMerge = [];
    var overallDecreasing = [];

    var dispatchElement = document;

    document.addEventListener('wheel', handleWheel);

    function tearDown(){
        document.removeEventListener('wheel', handleWheel);
    }

    function handleWheel(e){
        if(!isScrolling){
            beginScroll(e);
        }

        clearTimeout(scrollEndedTimeout);

        scrollEndedTimeout = setTimeout(function(){
            endScroll(e);
        }, 50);

        var currentDelta =  Math.abs(e.deltaY) ? e.deltaY : e.deltaX;
        var currentAbsDelta = Math.abs(currentDelta);

        // dev only for drawing
        var wheelTimeStamp = Date.now() - currentScrollStartedAt;

        if(e.deltaMode !== 0){
            console.error('deltaMode is not 0');
            return tearDown();
        }

        if(currentAbsDelta > lastAbsDelta) {
            endScroll(e);
            beginScroll(e);
        }

        lastAbsDelta = currentAbsDelta;

        requestAnimationFrame(function(){
            draw(wheelTimeStamp, currentAbsDelta);
        });

        scrollPointsToMerge.push({
            currentDelta,
            currentAbsDelta
        });

        if(scrollPointsToMerge.length === WHEELEVENTS_TO_MERGE){
            scrollPoints.push({
                currentDelta: Math.round(scrollPointsToMerge.reduce((a,b) => a + b.currentDelta, 0) / WHEELEVENTS_TO_MERGE),
                currentAbsDelta: Math.round(scrollPointsToMerge.reduce((a,b) => a + b.currentAbsDelta, 0) / WHEELEVENTS_TO_MERGE)
            });

            // reset merge array
            scrollPointsToMerge.length = 0;

            if(scrollPoints.length > WHEELEVENTS_TO_ANALAZE) {
                if(!isMomentum && checkForMomentum()) {
                    dispatchEvent('momentumwheelstarted', e);
                } else if(isMomentum) {
                    checkForEnding();
                }
            }
        }

        dispatchEvent('momentumwheel', e);
    }

    function beginScroll(e){
        willEndSoon = false;
        isScrolling = true;
        isMomentum = false;
        currentScrollStartedAt = Date.now();
        lastAbsDelta = Infinity;
        scrollPoints = [];
        overallDecreasing.length = 0;
        scrollPointsToMerge.length = 0;

        ctx.clearRect(0, 0, canvas.width,canvas.height);
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight);
    }

    function endScroll(e){
        if(isMomentum){
            isMomentum = false;
            momentumEnded(e);
        }

        isScrolling = false;
    }

    function momentumEnded(e){
        if(!willEndSoon){
            dispatchEvent('momentumwheelinterrupted', e);
        } else {
            dispatchEvent('momentumwheelended', e);
        }
    }

    function dispatchEvent(type, e, opts){
        dispatchElement.dispatchEvent(
            Object.assign(
                new window.WheelEvent(type, e),
                {
                    isMomentum: isMomentum
                },
                opts
            )
        );
    }

    function draw(x,_y){
        var absY = Math.abs(_y);
        var y = canvasHeight - absY;
        ctx.lineTo(x,y);
        ctx.stroke();
    }

    function checkForMomentum(){
        if(isMomentum){
            return isMomentum;
        }

        // get the latest WHEELEVENTS_TO_ANALAZE
        let scrollPointsToAnalize = scrollPoints.slice(WHEELEVENTS_TO_ANALAZE * -1);
        let scrollPointsToAnalizeAbsDeltas = scrollPointsToAnalize.map((scrollPoint)=>scrollPoint.currentAbsDelta);

        if(scrollPointsToAnalize.length < WHEELEVENTS_TO_ANALAZE){
            return console.error('not enough points.');
        }

        // check if delta is all decreasing
        let absDeltasMin = Math.min.apply(null, scrollPointsToAnalizeAbsDeltas);
        let absDeltasMax = Math.max.apply(null, scrollPointsToAnalizeAbsDeltas);
        let isOverallDecreasing = absDeltasMin < absDeltasMax && absDeltasMin === scrollPointsToAnalizeAbsDeltas[scrollPointsToAnalizeAbsDeltas.length - 1];


        overallDecreasing.push(isOverallDecreasing);

        if(checkDecreases(overallDecreasing)){
            isMomentum = true;
        }

        return isMomentum;
    }

    function checkForEnding(){
        let scrollPointsToAnalize = scrollPoints.slice(WHEELEVENTS_TO_ANALAZE * -1);
        let scrollPointsToAnalizeAbsDeltas = scrollPointsToAnalize.map((scrollPoint)=>scrollPoint.currentAbsDelta);
        let absDeltaAvrg = scrollPointsToAnalizeAbsDeltas.reduce((a,b) => a+b) / scrollPointsToAnalizeAbsDeltas.length;

        if(absDeltaAvrg < 1.3){
            willEndSoon = true;
        }

        return willEndSoon;
    }

    function checkDecreases(decreaseBooleans){
        let decreaseBooleansToCheck = decreaseBooleans.slice(-3);
        if(decreaseBooleansToCheck.length < 3){
            return false;
        }
        return decreaseBooleansToCheck.reduce((a,b) => a && b);
    }

})();
