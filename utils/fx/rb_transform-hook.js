const rb = window.rb;
const $ = rb.$;

const hookExpando = rb.Symbol('_rbCssTransformHooks');
const supports3dTransform = window.CSS && CSS.supports && CSS.supports('(transform: translate3d(0,0,0))');
const defaults = {};
const units = {};

const setTransformString = function(element) {
    let prop;
    const props = element[hookExpando];
    const transforms = [];

    for(prop in props){
        if(props[prop] !== defaults[prop]){
            transforms.push(prop + '('+ props[prop] + units[prop] +')');
        }
    }
    element.style.transform = transforms.join(' ');
};

const createHook = function(name, defaultVal, unit){
    const rbName = 'rb' + name;

    defaults[name] = defaultVal || 0;
    units[name] = unit || '';

    $.cssNumber[rbName] = true;

    $.fx.step[rbName] = function( fx ) {
        $.cssHooks[rbName].set( fx.elem, fx.now );
    };

    $.cssHooks[rbName] = {
        get: function(element, computed, extra){
            var value = element[hookExpando] && element[hookExpando][name] || defaultVal || 0;
            if(!extra){
                value += unit;
            }

            return value;
        },
        set: function(element, value){
            if(!element[hookExpando]){
                element[hookExpando] = {};
            }
            element[hookExpando][name] = value === '' ?
                defaultVal :
                value
            ;
            setTransformString(element);
        }
    };
};

createHook('rotate', 0, 'deg');
createHook('skewX', 0, 'deg');
createHook('skewY', 0, 'deg');
createHook('scaleX', 1, '');
createHook('scaleY', 1, '');
createHook('translateX', 0, 'px');
createHook('translateY', 0, 'px');

if(supports3dTransform){
    createHook('translateZ', 0, 'px');
    createHook('rotateX', 0, 'deg');
    createHook('rotateY', 0, 'deg');
}
