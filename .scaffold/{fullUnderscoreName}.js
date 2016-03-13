(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    var rb = window.rb;
    var $ = rb.$;

    var {Name} = rb.Component.extend('{name}',
        /** @lends rb.components.{name}.prototype */
        {
            /**
             * @static
             * @property {Object} defaults
             */
            defaults: {

            },
            /**
             * @constructs
             * @classdesc Class component to create a {Name}.
             * @name rb.components.{name}
             * @extends rb.Component
             * @param element {Element}
             * @param [initialDefaults] {Object}
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

    return {Name};
}));
