const rb = window.rb;

rb.lazyEach = function(list, handler, max, index){

    let item, start;
    const length = list.length;

    if(!max){
        max = 4;
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
            rb.rIC(function(){ // eslint-disable-line no-loop-func
                rb.lazyList(list, handler, max, index);
            });
            break;
        }
    }
};

export default rb.lazyEach;
