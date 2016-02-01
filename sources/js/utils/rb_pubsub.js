(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';

    if (!window.rb) {
        window.rb = {};
    }

    var rb = window.rb;

    rb.createPubSub = function(obj){
        var stores = {};
        var stored = {};

        Object.assign(obj, {
            pub: function(topic, data, memoize){
                var tmp;
                if(arguments.length == 3){
                    if(typeof memoize != 'boolean'){
                        tmp = data;
                        data = memoize;
                        memoize = tmp;
                    }
                }

                if(stores[topic]){
                    stores[topic].fireWith(data, [data]);
                }

                if(memoize){
                    stored[topic] = data;
                } else if(topic in stored){
                    rb.log('memoize once, memoize always');
                }
            },
            sub: function(topic, handler, getStored){
                var tmp;
                if(typeof getStored == 'function'){
                    tmp = handler;
                    handler = getStored;
                    getStored = tmp;
                }

                if(!stores[topic]){
                    stores[topic] = rb.$.Callbacks();
                }
                stores[topic].add(handler);

                if(getStored && topic in stored){
                    handler.call(stored[topic], stored[topic]);
                }
            },
            unsub: function(topic, handler){
                if(stores[topic]){
                    stores[topic].remove(handler);
                }
            },
        });
    };

    rb.createPubSub(rb);

    return rb.createPubSub;
}));
