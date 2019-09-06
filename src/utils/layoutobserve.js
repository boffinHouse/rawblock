import rb from './global-rb';
import Callbacks from '../rb_$/$_callbacks';
import rbSymbol from './symbol';
import rAFQueue, { afterframePhase } from './rafqueue';
import events from './events';

let observeClass, observedElements;

const layoutObserveProp = rbSymbol('layoutObserve');

let isInstalled = false;
let resumeElementIndex = 0;
let elementIndex = 0;

const readSaveResumeCheckElements = function(){
    afterframePhase(resumeCheckElements);
};

const resumeCheckElements = function(){
    if(resumeElementIndex == elementIndex){
        checkElements();
    }
};

const checkElements = function (e){
    let element, start, observer, event;
    const length = observedElements.length;

    for(; elementIndex < length; elementIndex++){
        element = observedElements[elementIndex];

        if(element){

            if(!(observer = element[layoutObserveProp])){
                /* jshint loopfunc: true */
                rAFQueue(function(){ // eslint-disable-line no-loop-func
                    element.classList.remove(observeClass);
                }, true);
                continue;
            }

            event = [{target: element, type: 'rb_layoutchange', originalEvent: e}];

            observer.cbs.fireWith(element, event);
        }

        if(!start){
            start = Date.now();
        } else if(Date.now() - start > 3){
            elementIndex++;
            resumeElementIndex = elementIndex;
            readSaveResumeCheckElements();
            return;
        }
    }

    elementIndex = 0;
};

const throtteledCheckElements = rb.throttle((function(e){
    elementIndex = 0;
    checkElements(e);
}), {read: true, delay: 400});

const addEvents = function(){
    if(isInstalled){return;}
    isInstalled = true;

    observeClass = ['js', 'rb', 'layoutobserve'].join(rb.cssConfig.nameSeparator || rb.nameSeparator);
    observedElements = document.getElementsByClassName(observeClass);

    window.addEventListener('scroll', throtteledCheckElements, true);
    window.addEventListener('resize', throtteledCheckElements);

    if(window.MutationObserver){
        new MutationObserver( throtteledCheckElements ).observe( rb.root, {childList: true, subtree: true, attributes: true} );
    } else {
        rb.root.addEventListener('DOMNodeInserted', throtteledCheckElements, true);
        rb.root.addEventListener('DOMAttrModified', throtteledCheckElements, true);
        setInterval(throtteledCheckElements, 999);
    }

    window.addEventListener('hashchange', throtteledCheckElements, true);

    ['focus', 'click', 'mouseover', 'load', 'transitionend', 'animationend', 'webkitAnimationEnd'].forEach(function(name){
        document.addEventListener(name, throtteledCheckElements, true);
    });
};

events.special.rb_layoutchange = events.special.rb_layoutchange || {
    add: function (elem, fn, _opts) {
        let observer = elem[layoutObserveProp];

        if(!observer){
            observer = {
                cbs: Callbacks(),
            };

            elem[layoutObserveProp] = observer;

            addEvents();

            rAFQueue(function(){
                elem.classList.add(observeClass);
            }, true);
        }

        observer.cbs.add(fn);
    },
    remove: function (elem, fn, _opts) {
        const observer = elem[layoutObserveProp];

        if(!observer){return;}

        observer.cbs.remove(fn);

        if(!observer.cbs.has()){
            delete elem[layoutObserveProp];
            rAFQueue(function(){
                elem.classList.remove(observeClass);
            }, true);
        }
    },
};

events.special.rb_layoutobserve = events.special.rb_layoutchange;

export default events.special.rb_layoutchange;

if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
    if(rb.z__layoutobserve){
        rb.logError('layoutobserve should only be added once');
    }
    rb.z__layoutobserve = true;
}
