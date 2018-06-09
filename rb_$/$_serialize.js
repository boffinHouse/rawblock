import glob from '../utils/glob';
import rb from '../utils/global-rb';

import './$_param';
import serialize from '../utils/serialize';

const $ = rb.$ || glob.jQuery;

if(!$.fn.serializeArray || !$.fn.serialize){

    $.fn.serializeArray = function(){
        return serialize(this.get());
    };

    $.fn.serialize = function(){
        return $.param(this.serializeArray());
    };
}

export default $.fn.serializeArray;
