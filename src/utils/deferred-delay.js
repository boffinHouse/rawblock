import deferred from './deferred';
import rb from './global-rb';

export default function deferredDelay(delay, readOptimized){
    const promise = deferred();
    const start = Date.now();
    const rAF = readOptimized ?
        (fn)=> {
            setTimeout(fn, 30);
        } :
        (fn) => {
            requestAnimationFrame(fn);
        }
    ;
    const startRaf = ()=> {
        rAF(check);
    };

    const check = ()=> {
        if(Date.now() - start >= delay){
            promise.resolve();
        } else {
            rAF(check);
        }
    };

    if(delay > 31){
        setTimeout(startRaf, delay - 30);
    } else {
        rAF(check);
    }

    return promise;
}

rb.deferredDelay = deferredDelay;
