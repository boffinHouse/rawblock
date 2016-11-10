if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
    const helpers = {};
    const devData = {
        componentsCount: 0,
    };

    helpers.onEventsAdd = function(element, type, handler, opts){
        if(opts && (type == 'mouseenter' || type == 'mouseleave' || type == 'focusin' || type == 'focusout')){

            if(!opts.capture && (opts.closest || opts.matches)){
                rb.logInfo('mouseenter/mouseleave/focusin/focusout delegated without capture option.', arguments);
            }

            if(opts.capture && opts.closest){
                rb.logInfo('mouseenter/mouseleave/focusin/focusout delegated with :closest instead of :matches.', arguments);
            }
        }

        if(type == 'focusin' || type == 'focusout'){
            rb.logInfo('focusin/focusout used. consider using focus/blur with :capture.', arguments);
        }
    };

    let searchElementsStartTime;
    helpers.onSearchElementsStart = function () {
        searchElementsStartTime = Date.now();
    };

    helpers.onSearchElementsEnd = function (len) {
        if(len > 99){
            rb.logWarn(`${len} component elements were initialized. Try to lower this number.`);
        } else {
            rb.logInfo(`${len} component elements were initialized.`);
        }

        searchElementsStartTime = Date.now() - searchElementsStartTime;

        if(searchElementsStartTime > 99){
            rb.logWarn(`Component initialization without rendering took ${searchElementsStartTime}. Try to lower this number.`);
        } else {
            rb.logInfo(`Component initialization without rendering took ${searchElementsStartTime}.`);
        }
    };

    if(window.EventTarget && EventTarget.prototype.addEventListener){
        (function(target){
            const eventSymbol = window.Symbol && window.Symbol('_debugEvents') || '_debugEvents' + Date.now();
            const addEventListener = target.addEventListener;
            const removeEventListener = target.removeEventListener;
            const hasMultiHandlerCount = function (list, needle) {
                const firstIndex = list ? list.indexOf(needle) : -1;

                return firstIndex != -1 && list.lastIndexOf(needle) != firstIndex;
            };

            target.addEventListener = function(type, handler){

                if(!this[eventSymbol]){
                    this[eventSymbol] = {};
                }
                if(!this[eventSymbol][type]){
                    this[eventSymbol][type] = [];
                }

                this[eventSymbol][type].push(handler);

                if(hasMultiHandlerCount(this[eventSymbol][type], handler)){
                    setTimeout(()=>{
                        if( (hasMultiHandlerCount(this[eventSymbol][type], handler)) ){
                            rb.logWarn(`EventTarget has multiple same handlers for ${type}`, arguments, handler);
                        }
                    }, 99);
                }

                return addEventListener.apply(this, arguments);
            };

            target.removeEventListener = function(type, handler){
                if(this[eventSymbol] && this[eventSymbol][type]){
                    const index = this[eventSymbol][type].indexOf(handler);

                    if(index != -1){
                        this[eventSymbol][type].splice(index, 1);
                    }

                    if(hasMultiHandlerCount(this[eventSymbol][type], handler)){
                        setTimeout(()=>{
                            if(hasMultiHandlerCount(this[eventSymbol][type], handler)){
                                rb.logWarn(`EventTarget has multiple same handlers for ${type}`, arguments, handler);
                            }
                        }, 99);
                    }
                }

                return removeEventListener.apply(this, arguments);
            };
        })(EventTarget.prototype);
    }

    Object.assign(window.rb, {
        debugHelpers: helpers,
        devData: devData,
    });


    if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
        window.addEventListener('load', ()=>{
            if(rb.devData.componentsCount > 99){
                rb.logWarn(`${devData.componentsCount} components were registered before rb.ready. Try to lower this number.`);
            } else {
                rb.logInfo(`${devData.componentsCount} components were registered before rb.ready.`);
            }
        });
    }

    module.exports = helpers;
}
