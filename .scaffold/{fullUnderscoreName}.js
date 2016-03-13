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

    return rb.Component.extend('{name}',
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

}));
