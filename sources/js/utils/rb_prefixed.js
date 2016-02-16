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
    var style = document.createElement('b').style;
    var rb = window.rb;
    var prefixes = ['Webkit', 'webkit', 'Moz', 'moz', 'Ms', 'ms'];

    rb.prefixed = function(name, obj){
        obj = obj || style;
        var i, partName, testName;
        var ret = '';

        name = rb.camelCase(name);

        if(name in obj){
            ret = name;
        }

        if(!ret){
            partName = rb.camelCase('-' + name);
            for(i = 0; i < prefixes.length && !ret; i++){
                testName = prefixes[i] + partName;
                if(testName in obj){
                    ret = testName;
                    break;
                }
            }
        }

        return ret;
    };

    return rb.prefixed;
}));
