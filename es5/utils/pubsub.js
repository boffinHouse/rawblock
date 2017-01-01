(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.pubsub = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var rb = window.rb;

    var throttle = function throttle(fn) {
        var isRunning = void 0,
            that = void 0,
            args = void 0;
        var promise = Promise.resolve();
        var waits = [];

        var run = function run() {
            isRunning = false;
            fn.apply(that, args);
        };

        var cleanupWaits = function cleanupWaits() {
            while (waits.length) {
                waits.shift()();
            }
        };

        var throttled = function throttled() {
            that = this;
            args = arguments;
            if (!isRunning) {
                isRunning = true;
                promise.then(run);
            } else if (waits.length) {
                cleanupWaits();
            }
        };

        var afterRun = function afterRun(fn) {
            if (isRunning) {
                waits.push(fn);
            } else {
                fn();
            }
        };

        return {
            throttled: throttled,
            afterRun: afterRun
        };
    };

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
    rb.createPubSub = function (obj, options) {
        var stores = {};
        var stored = {};

        var publish = function publish(topic, data, memoize) {
            if (stores[topic]) {
                stores[topic].fireWith(data, [data]);
            }

            if (memoize) {
                stored[topic] = data;
            } else if (topic in stored) {
                rb.log('memoize once, memoize always');
            }
        };

        var pub = function pub(topic, data, memoize) {
            var topics = void 0,
                tmp = void 0;

            if (arguments.length == 3) {
                if (typeof memoize != 'boolean') {
                    tmp = data;
                    data = memoize;
                    memoize = tmp;
                }
            }

            publish('', data, memoize);

            if (options.topicSeparator) {
                topics = topic.split(options.topicSeparator);

                if (topics.length > 1) {
                    topic = topics.reduce(function (mainTpoic, subTopic) {
                        if (mainTpoic) {
                            publish(mainTpoic, data, memoize);
                        }
                        return mainTpoic + options.topicSeparator + subTopic;
                    });
                }
            }

            if (topic) {
                publish(topic, data, memoize);
            }

            return this;
        };

        options = Object.assign({
            privatePublish: false,
            topicSeparator: ':/'
        }, options || {});

        Object.assign(obj, {
            subscribe: function subscribe(topic, handler, getStored) {
                var tmp = void 0;

                if (typeof getStored == 'function') {
                    tmp = handler;
                    handler = getStored;
                    getStored = tmp;
                }

                if (!topic) {
                    topic = '';
                }

                if (!stores[topic]) {
                    stores[topic] = rb.$.Callbacks();

                    if (options.throttle) {
                        stores[topic]._throttle = throttle(stores[topic].fireWith);
                        stores[topic].fireWith = stores[topic]._throttle.throttled;
                    }
                }

                if (options.throttle) {
                    stores[topic]._throttle.afterRun(function () {
                        stores[topic].add(handler);
                    });
                } else {
                    stores[topic].add(handler);
                }

                if (getStored && topic in stored) {
                    handler.call(stored[topic], stored[topic]);
                }

                return this;
            },
            unsubscribe: function unsubscribe(topic, handler) {
                if (!topic) {
                    topic = '';
                }

                if (stores[topic]) {
                    stores[topic].remove(handler);
                }
                return this;
            }
        });

        if (!options.privatePublish) {
            obj.publish = pub;
        }

        if (options.eventName) {

            if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
                if (rb.events.special[options.eventName]) {
                    rb.logWarn('special event for ' + options.eventName + ' already exists.', rb.events.special[options.eventName]);
                }
            }

            rb.events.special[options.eventName] = {};

            [['add', 'subscribe'], ['remove', 'unsubscribe']].forEach(function (action) {
                rb.events.special[options.eventName][action[0]] = function (element, handler) {
                    var eventOpts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                    if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {

                        if (element != window && element != document) {
                            rb.logError('subscribe/unsubscribe only to window/document', arguments);
                        }
                    }

                    var addRemove = function addRemove() {
                        obj[action[1]](options.topic, handler, eventOpts.getStored);
                    };

                    if (eventOpts.eventPromise && !eventOpts.eventPromise.isDone) {
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

    exports.default = rb.createPubSub;
});
