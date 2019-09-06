import rb from './global-rb';
import deferred from './deferred';

let isInProgress, inProgressStack;
const fns1 = [];
const fns2 = [];
const immediatePromise = Promise.resolve();


let curFns = fns1;

const setProgressFalse = () => {
    isInProgress = false;
};

const run = function () {
    if(curFns.length){
        inProgressStack = curFns;
        curFns = fns1.length ? fns2 : fns1;

        isInProgress = true;

        while (inProgressStack.length) {
            inProgressStack.shift()();
        }

        immediatePromise.then(setProgressFalse);
    }
};

/**
 * Invokes a function inside a rAF call
 * @memberof rb
 * @alias rb#rAFQueue
 * @param fn {Function} the function that should be invoked
 * @param [inProgress=true] {boolean} Whether the fn should be added to an ongoing rAF or should be appended to the next rAF.
 */
export default function rAFQueue(fn, inProgress = true) {

    if (inProgress && isInProgress) {
        immediatePromise.then(fn);
    } else {
        curFns.push(fn);
        if (curFns.length == 1) {
            (!document.hidden ? requestAnimationFrame : setTimeout)(run);
        }
    }
}

let rafPromise;

/**
 * If no function is given returns a promise that is resolved in the mutation phase
 * @param [fn] {Function} Function that will be executed in the mutation phase
 * @return {Promise}
 */
export const mutationPhase = (fn) => {
    if(fn){
        rAFQueue(fn, true);
    } else if(!rafPromise || rafPromise.isResolved){
        rafPromise = deferred();
        rAFQueue(rafPromise.resolve, true);
    }

    return rafPromise;
};

let measurePromise;
const measurePhaseChannel = new MessageChannel();

measurePhaseChannel.port1.onmessage = () => {
    if (measurePromise && measurePromise.resolve) {
        measurePromise.resolve();
    }
};

function postMeasurePhaseMessage() {
    measurePhaseChannel.port2.postMessage(undefined);
}

/**
 * Returns a promise that is resolved in the measure/read phase.
 * @return {Promise<void> | Deferred}
 */
export const measurePhase = (fn) => {
    let promise;

    if (isInProgress) {
        if (!measurePromise || measurePromise.isResolved) {
            measurePromise = deferred();
            postMeasurePhaseMessage();
        }

        promise = measurePromise;
    } else {
        promise = immediatePromise;
    }

    if (fn) {
        promise.then(fn);
    }

    return promise;
};

let afterframePromise;
const afterframePhaseChannel = new MessageChannel();

afterframePhaseChannel.port1.onmessage = () => {
    if (afterframePromise && afterframePromise.resolve) {
        afterframePromise.resolve();
    }
};

function postAfterframePhaseMessage() {
    afterframePhaseChannel.port2.postMessage(undefined);
}

/**
 *
 * Returns a promise that is resolved in the afterframe/read phase.
 * @return {Promise<void> | Deferred}
 */
export const afterframePhase = (fn) => {

    if (!afterframePromise || afterframePromise.isResolved) {
        afterframePromise = deferred();

        if (isInProgress) {
            postAfterframePhaseMessage();
        } else {
            rAFQueue(postAfterframePhaseMessage, true);
        }

    }

    if (fn) {
        afterframePromise.then(fn);
    }

    return afterframePromise;
};

rb.rAFQueue = rAFQueue;
