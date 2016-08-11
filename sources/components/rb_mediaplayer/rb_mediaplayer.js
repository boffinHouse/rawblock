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
    var $ = rb.$;

    var MediaPlayer = rb.Component.extend('mediaplayer',
        /** @lends rb.components.mediaplayer.prototype */
        {
            /**
             * @static
             * @mixes rb.Component.prototype.defaults
             * @property {Object} defaults
             * @prop {Boolean} foo=true
             */
            defaults: {

            },

            events: {
                // 'play:matches(.{name}{e}provider)': '',
            },

            statics: {
                addPlugin: function () {

                },
                addProvider: function(){

                },
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
            init: function (element, initialDefaults) {
                this._super(element, initialDefaults);


            },

        }
    );

    return MediaPlayer;
}));
