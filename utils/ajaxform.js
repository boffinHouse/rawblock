import '../rb_$/$_serialize';
import fetch from './fetch';

const $ = window.rb.$ || window.jQuery;

export function getFormFetchOptions(element){
    const fetchOpts = {
        url: element.action,
        type: element.method.toUpperCase(),
    };

    if(fetchOpts.type == 'POST'){
        Object.assign(fetchOpts, {
            data: new FormData(element),
            contentType: false,
            processData: false,
        });
    } else {
        fetchOpts.url += '?' + $(element).serialize();
    }

    return fetchOpts;
}

export default function fetchForm(element){
    return fetch(getFormFetchOptions(element));
}
