(function (factory) {
    if (typeof module === 'object' && module.exports) {
        //optional dependencies
        //require('../../js/utils/rb_fetch');
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    var rb = window.rb;
    var $ = rb.$;

    var Test = rb.Component.extend('test',
        /** @lends rb.components.test.prototype */
        {
            /**
             * @static
             * @property {Object} defaults
             */
            defaults: {

            },
            /**
             * @constructs
             * @classdesc Class component to create a Test.
             * @name rb.components.test
             * @extends rb.Component
             * @param element {Element}
             *
             *
             * @example
             */
            init: function (element, initialDefaults) {
                this._super(element, initialDefaults);
            },
            events: {

            },
            setOption: function(name, value){
                this._super(name, value);
            },
        }
    );

    return Test;
}));
