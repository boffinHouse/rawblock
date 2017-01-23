import deferred from './deferred';

const rb = window.rb;
const promises = {};

/**
 * Loads a script and returns a promise.
 * @memberof rb
 *
 * @param src
 * @param [options={}]
 * @param options.async
 * @param options.defer
 * @param options.instantInject
 * @returns {Promise}
 */
rb.loadScript = function (src, options = {}) {
    if(!promises[src]){
        let script = document.createElement('script');

        const inject = function () {
            (document.body || document.documentElement).appendChild(script);
            script = null;
        };

        promises[src] = deferred();

        script.addEventListener('load', ()=> {
            promises[src].resolve();
        });
        script.addEventListener('error', () => {
            rb.logWarn('load script error. Configure rb.packageConfig? src: ' + src);
            promises[src].resolve();
        });

        script.src = src;
        script.async = !!options.async;
        script.defer = !!options.defer;

        if(document.body && !options.instantInject){
            (rb.rAFQueue || requestAnimationFrame)(inject);
        } else {
            inject();
        }
    }

    return promises[src];
};

rb.loadScript.rb_promises = promises;

export default rb.loadScript;
