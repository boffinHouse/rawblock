var promise = require('es6-promise');
module.exports = {
    root: 'http://localhost:9001/',
    waitForJsReady: function(){
        var ready, run;
        return function check() {
            var isDomReady;
            if(!run){
                isDomReady = this.evaluate(function() {
                    return document.readyState == 'complete';
                });

                if(isDomReady){
                    run = true;
                    setTimeout(function(){
                        ready = true;
                    }, 50);
                }
            }

            return ready;
        };
    },
    deferred: function(){
        var obj = {};
        var deferred = new Promise(function(resolve){
            obj._res = resolve;
        });

        deferred._resolve = obj._res;
        deferred._res = obj._res;
        return deferred;
    },
};
