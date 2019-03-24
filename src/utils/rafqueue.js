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

/**
 * Returns a promise that is resolved in the measure/read phase.
 * @return {Promise<void> | Deferred}
 */
export const measurePhase = () => {
    let promise;

    if (isInProgress) {
        if (!measurePromise || measurePromise.isResolved()) {
            measurePromise = deferred();
            setTimeout(measurePromise.resolve);
        }

        promise = measurePromise;
    } else {
        promise = immediatePromise;
    }

    return promise;
};

rb.rAFQueue = rAFQueue;
