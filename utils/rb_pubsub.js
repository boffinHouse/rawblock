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

    const rb = window.rb;

	/**
     * extends an object with subscribe, unsubscribe and optionally with a publish method.
     * @param obj {{}}
     * @param [options] {{}}
     *  @param options.privatePublish=false {boolean}
     *  @param options.topicSeparator=':/' {boolean|string}
     *  @param options.eventName=false {boolean|string}
     *  @param options.eventPromise=false {undefined|boolean|Promise|rb.deferred}
     * @returns {function} the publish function.
     */
    rb.createPubSub = function(obj, options){
        const stores = {};
        const stored = {};

        const publish = function(topic, data, memoize){
            if(stores[topic]){
                stores[topic].fireWith(data, [data]);
            }

            if(memoize){
                stored[topic] = data;
            } else if(topic in stored){
                rb.log('memoize once, memoize always');
            }
        };

        const pub = function(topic, data, memoize){
            var topics, tmp;
            if(arguments.length == 3){
                if(typeof memoize != 'boolean'){
                    tmp = data;
                    data = memoize;
                    memoize = tmp;
                }
            }

            if(options.topicSeparator){
                topics = topic.split(options.topicSeparator);

                if(topics.length > 1){
                    topic = topics.reduce((mainTpoic, subTopic)=>{
                        publish(mainTpoic, data, memoize);
                        return mainTpoic + options.topicSeparator + subTopic;
                    });
                }
            }

            publish(topic, data, memoize);

            return this;
        };

        options = Object.assign({
            privatePublish: false,
            topicSeparator: ':/',
        }, options || {});

        Object.assign(obj, {
            subscribe: function(topic, handler, getStored){
                let tmp;

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

                return this;
            },
            unsubscribe: function(topic, handler){
                if(stores[topic]){
                    stores[topic].remove(handler);
                }
                return this;
            },
        });

        if(!options.privatePublish){
            obj.publish = pub;
        }

        if(options.eventName){
            [['add', 'subscribe'], ['remove', 'unsubscribe']].forEach((action) => {
                rb.events.special[action[0]] = function(element, handler, eventOpts = {}){
                    if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){

                        if(!options.topic){
                            rb.logError('you need to define a topic', arguments);
                        }

                        if(element != window && element != document){
                            rb.logError('subscribe/unsubscribe only to window/document', arguments);
                        }
                    }

                    const addRemove = ()=>{
                        obj[action[0]](options.topic, handler);
                    };

                    if(eventOpts.eventPromise && !eventOpts.eventPromise.isDone){
                        eventOpts.eventPromise.then(addRemove);
                    } else {
                        addRemove();
                    }
                };
            });
        }

        return pub;
    };

    rb.createPubSub(rb);

    return rb.createPubSub;
}));
