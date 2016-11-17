(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'babel-runtime/helpers/typeof'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('babel-runtime/helpers/typeof'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global._typeof);
        global.rb_pubsub = mod.exports;
    }
})(this, function (module, _typeof2) {
    'use strict';

    var _typeof3 = _interopRequireDefault(_typeof2);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    (function (factory) {
        if ((typeof module === 'undefined' ? 'undefined' : (0, _typeof3.default)(module)) === 'object' && module.exports) {
            module.exports = factory();
        } else {
            factory();
        }
    })(function () {
        'use strict';

        if (!window.rb) {
            window.rb = {};
        }

        var rb = window.rb;

        /**
            * extends an object with subscribe, unsubscribe and optionally with a publish method.
            * @param obj {{}}
            * @param [options] {{}}
            *  @param options.privatePublish=false {boolean}
            *  @param options.topicSeparator=':/' {boolean|string}
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
                var topics, tmp;
                if (arguments.length == 3) {
                    if (typeof memoize != 'boolean') {
                        tmp = data;
                        data = memoize;
                        memoize = tmp;
                    }
                }

                if (options.topicSeparator) {
                    topics = topic.split(options.topicSeparator);

                    if (topics.length > 1) {
                        topic = topics.reduce(function (mainTpoic, subTopic) {
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
                topicSeparator: ':/'
            }, options || {});

            Object.assign(obj, {
                subscribe: function subscribe(topic, handler, getStored) {
                    var tmp;
                    if (typeof getStored == 'function') {
                        tmp = handler;
                        handler = getStored;
                        getStored = tmp;
                    }

                    if (!stores[topic]) {
                        stores[topic] = rb.$.Callbacks();
                    }
                    stores[topic].add(handler);

                    if (getStored && topic in stored) {
                        handler.call(stored[topic], stored[topic]);
                    }

                    return this;
                },
                unsubscribe: function unsubscribe(topic, handler) {
                    if (stores[topic]) {
                        stores[topic].remove(handler);
                    }
                    return this;
                }
            });

            if (!options.privatePublish) {
                obj.publish = pub;
            }

            return pub;
        };

        rb.createPubSub(rb);

        return rb.createPubSub;
    });
});
