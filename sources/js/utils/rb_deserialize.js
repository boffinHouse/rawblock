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

    var regQ = /^\?/;

    var addProps = function(param){
        param = param.split('=');

        this[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || '');
    };

    rb.deserialize = function(str){
        var obj = {};

        str.replace(regQ, '').replace('+', ' ').split('&').forEach(addProps, obj);

        return obj;
    };

    return rb.deserialize;
}));
