import rb from './global-rb';

export function registerTemplate(name, fun) {

    if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
        if(rb.templates[name]){
            rb.logWarn(`${name} template already exists.`, rb.templates[name], fun);
        }
    }

    if(typeof fun == 'string'){
        fun = rb.template(fun);
    }

    rb.templates[name] = fun;
}

rb.registerTemplate = registerTemplate;

export default function renderPartial(name, obj){
    let html = '';

    if(rb.templates[name]){
        html = rb.templates[name](obj);
    } else {
        if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
            rb.logError(`${name} for partial not found and lazyload templates not supported`);
        }
    }

    return html;
}

rb.renderPartial = renderPartial;
