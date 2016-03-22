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
    disableFx: function(){

        casper.evaluate(function() {
            var div = document.createElement('div');
            if(window.jQuery){
                window.jQuery.fx.off = true;
            }
            rb.$.fx.off = true;

            div.style.display = 'none';
            document.body.appendChild(div);
            div.innerHTML = '<style> ' +
                '*, *::before, *::after {' +
                    '-webkit-transition: none !important;' +
                    'transition: none !important;' +
                    '-webkit-animation: none !important;' +
                    'animation: none !important;' +
                '} ' +
                '</style>'
            ;
        });
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
