const rIC = window.requestIdleCallback ?
    function(fn){
        return requestIdleCallback(fn, {timeout: 99});
    } :
    function(fn){
        return setTimeout(fn);
    }
;

export default rIC;

if(window.rb){
    window.rb.rIC = rIC;
}
