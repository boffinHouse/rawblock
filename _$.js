(function(){
    'use strict';
    if (typeof module == 'object' && module.exports && typeof require != 'undefined') {
        var $ = require('./rb_$/$_slim');
        require('./rb_$/$_fx');
        module.exports = $;
    }
})();
