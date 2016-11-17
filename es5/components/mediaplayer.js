(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod);
        global.mediaplayer = mod.exports;
    }
})(this, function (module) {
    'use strict';

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    (function (factory) {
        if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
            module.exports = factory();
        } else {
            factory();
        }
    })(function () {
        'use strict';
        /* jshint eqnull: true */

        var rb = window.rb;

        var MediaPlayer = rb.Component.extend('mediaplayer',
        /** @lends rb.components.mediaplayer.prototype */
        {
            /**
             * @static
             * @mixes rb.Component.prototype.defaults
             * @property {Object} defaults
             * @prop {Object|String} item=null
             */
            defaults: {
                item: null
            },

            events: {
                // 'play:matches(.{name}{e}provider)': '',
            },

            statics:
            /** @lends rb.components.mediaplayer */
            {
                STATE_UNREADY: 'unready',
                STATE_WAITING: 'waiting',
                STATE_PLAYING: 'playing',
                STATE_PAUSED: 'paused',
                STATE_ERROR: 'error',
                plugins: [],
                addPlugin: function addPlugin(plugin) {
                    this.plugins.push(plugin);
                },
                providers: [],
                addProvider: function addProvider(provider) {
                    this.providers.push(provider);
                }
            },

            /**
             * @constructs
             * @classdesc Creates a MediaPlayer component.
             *
             * @extends rb.Component
             *
             * @param element
             *
             *
             */
            init: function init(element, initialDefaults) {
                this._super(element, initialDefaults);

                this.unreadyList = [];
                this.currentProvider = null;

                if (this.options.item) {
                    this.load(this.options.item);
                }
            },

            load: function load(_item) {}
        });

        MediaPlayer.ProviderBase = function () {};

        MediaPlayer.ProviderBase.prototype = {};

        //provider functions
        ['play', 'pause', 'load', 'unload'].forEach(function (fn) {
            MediaPlayer.ProviderBase.prototype[fn] = function () {
                rb.logInfo(fn + ' not implemented.');
            };

            if (!(fn in MediaPlayer.prototype)) {
                MediaPlayer.prototype[fn] = function () {
                    if (this.currentProvider) {
                        if (this.currentProvider.readyState != MediaPlayer.STATE_UNREADY) {
                            this.currentProvider[fn].apply(this.currentProvider, arguments);
                        } else {
                            this.unreadyList.push([fn, arguments]);
                        }
                    }
                };
            }
        });

        //getters/setters
        [['currentTime', 0], ['muted', false], ['volume', 1]].forEach(function (fn) {
            var log = function log() {
                rb.logInfo(fn + ' not implemented.');
            };
            var defaultValue = fn[1];

            fn = fn[0];

            Object.defineProperty(MediaPlayer.ProviderBase.prototype, fn, {
                get: log,
                set: log,
                configurable: true,
                enumerable: true
            });

            if (!(fn in MediaPlayer.prototype)) {
                Object.defineProperty(MediaPlayer.prototype, fn, {
                    get: function get() {
                        if (this.currentProvider && this.currentProvider.readyState != MediaPlayer.STATE_UNREADY) {
                            return this.currentProvider[fn];
                        } else {
                            return defaultValue;
                        }
                    },
                    set: function set(value) {
                        if (this.currentProvider) {
                            if (this.currentProvider.readyState != MediaPlayer.STATE_UNREADY) {
                                this.currentProvider[fn] = value;
                            } else {
                                this.unreadyList.push([fn, value]);
                            }
                        }
                    },
                    configurable: true,
                    enumerable: true
                });
            }
        });

        return MediaPlayer;
    });
});
