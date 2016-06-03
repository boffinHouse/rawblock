(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    /* jshint eqnull: true */
    var rb = window.rb;

    rb.lazyEach = function(list, handler, max, index){

        var item, start;
        var length = list.length;

        if(!max){
            max = 5;
        }

        if(!index){
            index = 0;
        }

        for(; index < length; index++){
            item = list[index];

            if(item){
                handler(item);
            }

            if(!start){
                start = Date.now();
            } else if(Date.now() - start >= max){
                /* jshint loopfunc: true */
                rb.rIC(function(){
                    rb.lazyList(list, handler, max, index);
                });
                break;
            }
        }
    };

    return rb.lazyEach;
}));
