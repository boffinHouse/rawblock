//https://bugs.chromium.org/p/chromium/issues/detail?id=811451

const rIC = /*window.requestIdleCallback ?
    function(fn){
        return requestIdleCallback(fn, {timeout: 66});
    } :*/
    function(fn){
        return setTimeout(fn);
    }
;

export default rIC;

if(window.rb){
    window.rb.rIC = rIC;
}
