import './$_param';

const rb = window.rb;
const $ = rb.$ || window.jQuery;

if(!$.fn.serializeArray || !$.fn.serialize){
    const rCRLF = /\r?\n/g;
    const rcheckableType = ( /^(?:checkbox|radio)$/i );
    const rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i;
    const rsubmittable = /^(?:input|select|textarea|keygen)/i;

    $.fn.serializeArray = function(){
        const array = [];

        this.each(function(){
            const elements = Array.from(this.elements) || [this];

            elements.forEach(function(element){
                let type, options, i, len;

                if( element.name && !element.matches(':disabled') &&
                    rsubmittable.test( element.nodeName || '' ) &&
                    (type = element.type) && !rsubmitterTypes.test(type) &&
                    (element.checked || !rcheckableType.test( type )) ) {

                    if( (options = element.selectedOptions) ){
                        for(i = 0, len = options.length; i < len; i++){
                            array.push({name: element.name, value: (options[i].value || '').replace( rCRLF, '\r\n' )});
                        }
                    } else {
                        array.push({name: element.name, value: (element.value || '').replace( rCRLF, '\r\n' )});
                    }

                }
            });
        });

        return array;
    };

    $.fn.serialize = function(){
        return $.param(this.serializeArray());
    };
}

export default $.fn.serializeArray;
