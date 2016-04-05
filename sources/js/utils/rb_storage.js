(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';

    if (!window.rb) {
        window.rb = {};
    }

    var rb = window.rb;

    rb.storage = {};

    ['session', 'local'].forEach(function(type){
        var storage = window[type + 'Storage'];
        rb.storage[type] = {
            set: function(name, value){
                try {
                    storage.setItem(name, JSON.stringify(value));
                } catch(e){}
            },
            get: function(name){
                var value;
                try {
                    value = JSON.parse(storage.getItem(name));
                } catch(e){}

                return value;
            },
        };
    });

    return rb.storage;
}));
