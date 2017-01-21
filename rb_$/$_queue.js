import deferredDelay from '../utils/deferred-delay';

let queueExpando;
const defaultQueue = 'fx';
const rb = window.rb;
const $ = rb.$;

$.queue = function(element, queue, cb) {
    let queues;

    if (typeof queue == 'function') {
        cb = queue;
        queue = defaultQueue;
    }

    if(queue === true || !queue) {
        queue = defaultQueue;
    }

    if(!queueExpando){
        queueExpando = rb.Symbol('_rbQueue');
    }

    if( !(queues = element[queueExpando]) ){
        queues = {};
        element[queueExpando] = queues;
    }

    if ( !queues[queue] ) {
        queues[queue] = [];
    }

    if (cb) {
        queues[queue].push(cb);
    }

    return queues[queue];
};

$.dequeue = function(element, queue) {
    let queues, fn;

    if(!queue || queue === true){
        queue = defaultQueue;
    }

    queues = queueExpando && element[queueExpando];

    if ( queues && queues[queue] && (fn = queues[queue].shift()) ) {
        fn.call(element);
    }

    return queues[queue];
};

$.fn.promise = function(queue){
    let _run, queues, queueToEnd;

    const deferred = {
        resolve: function(){
            if(!_run){
                _run = true;
                setTimeout(deferred.resolve);
            }
        }
    };

    const promise = new Promise(function(resolve){
        deferred.resolve = resolve;
    });

    const element = this.get(0);

    if(element){
        queueToEnd = function(){
            if(queues.length){
                $.queue(element, queue, queueToEnd);
                $.dequeue(element, queue);
            } else {
                deferred.resolve();
            }
        };
        queues = $.queue(element, queue, queueToEnd);
        if(queues.length == 1){
            $.dequeue(element, queue);
        }
    } else {
        deferred.resolve();
    }
    return promise;
};

['queue', 'dequeue'].forEach(function(methodName){
    $.fn[methodName] = function(queue, callback){
        this.elements.forEach(function(element){
            $[methodName](element, queue, callback);
        });
        return this;
    };
});

$.fn.delay = function(queue, duration, cb) {

    if(typeof queue == 'number') {
        cb = duration;
        duration = queue;
        queue = defaultQueue;
    }

    this.queue(queue, function(){
        const elem = this;

        deferredDelay(duration).then(()=> {
            if(cb){
                cb.call(elem);
            }
            $.dequeue(elem, queue);
        });
    });
    return this;
};

$.fn.clearQueue = function(queue){
    this.elements.forEach(function(element){
        const queues = $.queue(element, queue);

        if(queues.length){
            queues.splice(0, queues.length);
        }
    });
    return this;
};
