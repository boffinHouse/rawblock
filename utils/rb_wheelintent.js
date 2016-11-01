(function (factory) {
    if (typeof module === 'object' && module.exports) {
        require('./rb_debounce');
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    /* jshint eqnull: true */
    var rb = window.rb;
    var $ = rb.$;
    var rbWheelProp = rb.Symbol('rbWheel');
    var special = rb.events.special;

    special.rb_wheelintent = {
        handler: function(e){
            var wheelData = this[rbWheelProp];

            if(wheelData && wheelData.cbs){
                wheelData.cbs.fireWith(this, [e]);
            }
        },
        enterHandler: function(e){
            var wheelData = this[rbWheelProp];

            if(!wheelData){
                this.removeEventListener('mouseenter', special.rb_wheelintent.enterHandler);
                return;
            }

            this.addEventListener('mousemove', special.rb_wheelintent.moveHandler);
            wheelData._page = [e.pageX, e.pageY];
            this.removeEventListener('wheel', special.rb_wheelintent.handler);
        },
        leaveHandler: function(){
            this.removeEventListener('mousemove', special.rb_wheelintent.moveHandler);
            this.removeEventListener('wheel', special.rb_wheelintent.handler);
        },
        moveHandler: function(e){
            var wheelData = this[rbWheelProp];

            if(!wheelData || !wheelData._page || wheelData.intent){
                this.removeEventListener('mousemove', special.rb_wheelintent.moveHandler);
                return;
            }

            if(Math.max(Math.abs(wheelData._page[0] - e.pageX), Math.abs(wheelData._page[1] - e.pageY)) > 5){
                this.removeEventListener('wheel', special.rb_wheelintent.handler);
                this.addEventListener('wheel', special.rb_wheelintent.handler);
                this.removeEventListener('mousemove', special.rb_wheelintent.moveHandler);
            }
        },
        add: function (elem, fn, opts) {
            var wheelData = elem[rbWheelProp];

            if(!wheelData){
                wheelData = {
                    cbs: $.Callbacks(),
                    intentCbs: $.Callbacks(),
                    intent: false,
                };

                elem[rbWheelProp] = wheelData;

                elem.addEventListener('mouseenter', special.rb_wheelintent.enterHandler);
                elem.addEventListener('mouseleave', special.rb_wheelintent.leaveHandler);
            }

            wheelData.cbs.add(fn);
        },
        remove: function (elem, fn, opts) {
            var wheelData = elem[rbWheelProp];

            if(!wheelData){return;}

            wheelData.cbs.remove(fn);

            if(!wheelData.cbs.has()){
                delete elem[rbWheelProp];
                elem.removeEventListener('wheel', special.rb_wheelintent.handler);
                elem.removeEventListener('mouseenter', special.rb_wheelintent.enterHandler);
                elem.removeEventListener('mouseleave', special.rb_wheelintent.leaveHandler);
                elem.removeEventListener('mousemove', special.rb_wheelintent.moveHandler);
            }
        },
    };

    return rb.events.special.rb_wheelintent;
}));
