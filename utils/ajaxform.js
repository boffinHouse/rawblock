/**
 * @module ajaxform
 */

import '../rb_$/$_serialize';
import fetch from './fetch';

const $ = window.rb.$ || window.jQuery;

/**
 * Returns option to fetch a form using rb.fetch.
 * @param element {HTMLFormElement}
 * @return {{url: (string), type: string, data: *}}
 */
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

/**
 * Fetches a form using rb.fetch
 *
 * @param element {HTMLFormElement}
 * @return {Promise}
 */
export default function fetchForm(element){
    return fetch(getFormFetchOptions(element));
}
