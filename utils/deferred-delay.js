import deferred from './deferred';

export default function deferredDelay(delay, readOptimized){
    const promise = deferred();
    const start = Date.now();
    const rAF = readOptimized ?
        (fn)=> {
            setTimeout(fn, 30);
        } :
        (fn) => {
            rb.rAFQueue(fn, false, true);
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

window.rb.deferredDelay = deferredDelay;
