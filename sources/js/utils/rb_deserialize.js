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

    var addProps = function(param){
        param = param.split('=');

        this[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || '');
    };

    rb.deSerialize = function(str){
        var obj = {};

        str.replace('+', ' ').split('&').forEach(addProps, obj);

        return obj;
    };

    return rb.deSerialize;
}));
