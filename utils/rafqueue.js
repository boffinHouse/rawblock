let isInProgress, inProgressStack;
const fns1 = [];
const fns2 = [];

let curFns = fns1;

const run = function () {
    inProgressStack = curFns;
    curFns = fns1.length ? fns2 : fns1;

    isInProgress = true;
    while (inProgressStack.length) {
        inProgressStack.shift()();
    }
    isInProgress = false;
};

/**
 * Invokes a function inside a rAF call
 * @memberof rb
 * @alias rb#rAFQueue
 * @param fn {Function} the function that should be invoked
 * @param [inProgress] {boolean} Whether the fn should be added to an ongoing rAF or should be appended to the next rAF.
 * @param [hiddenRaf] {boolean} Whether the rAF should also be used if document is hidden.
 */
export default function rAFQueue(fn, inProgress, hiddenRaf) {

    if (inProgress && isInProgress) {
        fn();
    } else {
        curFns.push(fn);
        if (curFns.length == 1) {
            ((hiddenRaf || !document.hidden) ? requestAnimationFrame : setTimeout)(run);
        }
    }
}

if(window.rb){
    window.rb.rAFQueue = rAFQueue;
}
