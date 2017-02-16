(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './rb_pubsub'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./rb_pubsub'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.rb_pubsub);
        global.model = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var rb = window.rb;
    var pubSubs = {};

    var Model = function () {
        function Model(data, options) {
            _classCallCheck(this, Model);

            this._data = data;

            options = Object.assign({ name: rb.getID(), topicSeparator: ':/', isItem: true }, options);

            this.options = options;

            this.generateId();

            this.createPubSub();
        }

        Model.prototype.createPubSub = function createPubSub() {
            var _options = this.options,
                name = _options.name,
                eventName = _options.eventName,
                topicSeparator = _options.topicSeparator,
                isItem = _options.isItem;


            this.eventName = eventName || name + (isItem ? 's' : '');

            var pubSubOptions = { eventName: this.eventName, topicSeparator: topicSeparator, throttle: true };

            this.pubSubName = pubSubOptions.eventName + topicSeparator;

            this.topicPrefx = isItem ? this.id : '';

            if (!pubSubs[this.pubSubName]) {
                pubSubs[this.pubSubName] = rb.createPubSub(this, pubSubOptions);
            }
        };

        Model.prototype._extendTopic = function _extendTopic(topic) {
            var extendedTopic = this.topicPrefx;

            if (topic) {
                extendedTopic += this.options.topicSeparator + topic;
            }

            return extendedTopic;
        };

        Model.prototype.subscribe = function subscribe(topic, fn, getStored) {
            pubSubs[this.pubSubName].subscribe(this._extendTopic(topic), fn, getStored);
        };

        Model.prototype.unsubscribe = function unsubscribe(topic, fn) {
            pubSubs[this.pubSubName].unsubscribe(this._extendTopic(topic), fn);
        };

        Model.prototype.publish = function publish(topic, data, memoize) {
            pubSubs[this.pubSubName].publish(this._extendTopic(topic), data, memoize);
        };

        Model.prototype.generateId = function generateId() {
            this.id = this._data && this._data.id || rb.getID();
        };

        Model.prototype.set = function set(name, _value) {
            if (arguments.length == 2) {
                //todo
            } else {
                this._data = name;
            }
        };

        Model.prototype.remove = function remove(_name) {
            //todo
        };

        return Model;
    }();

    rb.Model = Model;

    exports.default = Model;
});
