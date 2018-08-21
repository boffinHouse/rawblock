import rb from './global-rb';
import rbSymbol from './symbol';

const regSplit = /\s*?,\s*?|\s+?/g;

rb.events = {
    _init: function() {
        this.proxyKey = rbSymbol('_fnProxy');
    },
    Event: function(type, options){
        let event;

        if(!options){
            options = {};
        }

        if(options.bubbles == null){
            options.bubbles = true;
        }

        if(options.cancelable == null){
            options.cancelable = true;
        }

        event = new CustomEvent(type, options);

        if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
            if(!event.isDefaultPrevented){
                event.isDefaultPrevented = function(){
                    rb.logError('deprecated');
                };
            }
        }

        return event;
    },
    dispatch: function(element, type, options){
        const event = this.Event(type, options);
        element.dispatchEvent(event);
        return event;
    },
    proxy: function(fn, type, key, proxy){
        if(!proxy){
            return fn[this.proxyKey] && fn[this.proxyKey][type] && fn[this.proxyKey][type][key];
        }
        if(!fn[this.proxyKey]){
            fn[this.proxyKey] = {};
        }
        if(!fn[this.proxyKey][type]){
            fn[this.proxyKey][type] = {};
        }
        if(!fn[this.proxyKey][type][key]){
            fn[this.proxyKey][type][key] = proxy;
        }
        if(fn != proxy){
            this.proxy(proxy, type, key, proxy);
        }
    },
    _runDelegate: function(event, target, handler, context, args){
        if(!target){return;}

        let ret;
        const oldDelegatedTarget = event.delegatedTarget;
        const oldDelegateTarget = event.delegateTarget;

        event.delegatedTarget = target;
        event.delegateTarget = target;

        ret = handler.apply(context, args);

        event.delegatedTarget = oldDelegatedTarget;
        event.delegateTarget = oldDelegateTarget;

        return ret;
    },
    proxies: {
        closest: function(handler, selector){
            let proxy = rb.events.proxy(handler, 'closest', selector);

            if(!proxy){
                proxy = function(e){
                    return rb.events._runDelegate(e, e.target.closest(selector), handler, this, arguments);
                };
                rb.events.proxy(handler, 'closest', selector, proxy);
            }

            return proxy;
        },
        matches: function(handler, selector){
            let proxy = rb.events.proxy(handler, 'matches', selector);

            if(!proxy){
                proxy = function(e){
                    return rb.events._runDelegate(e, e.target.matches(selector) ? e.target : null, handler, this, arguments);
                };
                rb.events.proxy(handler, 'matches', selector, proxy);
            }

            return proxy;
        },
        keycodes: function(handler, keycodes){
            let keycodesObj;
            let proxy = rb.events.proxy(handler, 'keycodes', keycodes);

            if(!proxy){
                proxy = function(e){
                    if(!keycodesObj){
                        keycodesObj = keycodes.trim().split(regSplit).reduce(function(obj, value){
                            obj[value] = true;
                            return obj;
                        }, {});
                    }

                    if(keycodesObj[e.keyCode]){
                        return handler.apply(this, arguments);
                    }
                };

                rb.events.proxy(handler, 'keycodes', keycodes, proxy);
            }

            return proxy;
        },
        once: function(handler, once, opts, type){
            let proxy = rb.events.proxy(handler, 'once', '');

            if(!proxy){
                proxy = function(e){
                    const ret = handler.apply(this, arguments);

                    rb.events.remove(e && e.target || this, type, handler, opts);
                    return ret;
                };

                rb.events.proxy(handler, 'once', '', proxy);
            }

            return proxy;
        },
    },
    applyProxies: function(handler, opts, type){
        let proxy;

        if(opts){
            for(proxy in opts){
                if(this.proxies[proxy] && proxy != 'once'){
                    handler = this.proxies[proxy](handler, opts[proxy], opts, type);
                }
            }

            if('once' in opts){
                handler = this.proxies.once(handler, opts.once, opts, type);
            }
        }

        return handler;
    },
    special: {},
};

rb.events.proxies.delegate = rb.events.proxies.closest;

[['add', 'addEventListener'], ['remove', 'removeEventListener']].forEach(function(action){
    /**
     *
     * @name rb.event.add
     *
     * @param element
     * @param type
     * @param handler
     * @param opts
     */
    /**
     *
     * @name rb.event.remove
     *
     * @param element
     * @param type
     * @param handler
     * @param opts
     */
    rb.events[action[0]] = function(element, type, handler, opts){
        if(!this.special[type] || this.special[type].applyProxies !== false){
            handler = rb.events.applyProxies(handler, opts, type);
        }
        if(this.special[type]){
            this.special[type][action[0]](element, handler, opts);
        } else {
            const evtOpts = (opts && (opts.capture || opts.passive)) ?
                {passive: !!opts.passive, capture: !!opts.capture} :
                false
            ;

            element[action[1]](type, handler, evtOpts);

            if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
                rb.debugHelpers.onEventsAdd(element, type, handler, opts);
            }
        }
    };
});

rb.events._init();

export default rb.events;
