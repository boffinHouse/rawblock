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
    var $ = rb.$;
    var prefixes = ['Webkit', 'webkit', 'Moz', 'moz', 'Ms', 'ms', 'O', 'o'];

    /**
     * Gets a string and returns a prefixed version. If empty string is returned there is no support.
     *
     * @memberof rb
     *
     * @param {String} name
     * @param {Object} [object=document.createElement('b').style]
     * @return {string}
     */
    rb.prefixed = function(name, object){
        object = object || style;
        var i, partName, testName;
        var ret = '';

        name = $.camelCase(name);

        if(name in object){
            ret = name;
        }

        if(!ret){
            partName = $.camelCase('-' + name);
            for(i = 0; i < prefixes.length && !ret; i++){
                testName = prefixes[i] + partName;
                if(testName in object){
                    ret = testName;
                    break;
                }
            }
        }

        return ret;
    };

    return rb.prefixed;
}));
