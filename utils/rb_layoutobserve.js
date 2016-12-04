let observeClass, observedElements;

const rb = window.rb;
const $ = rb.$;
const layoutObserveProp = rb.Symbol('layoutObserve');
const rbRic = rb.rIC;

let isInstalled = false;
let resumeElementIndex = 0;
let elementIndex = 0;

const timedOutCheck = function(){
    rbRic(resumeCheckElements);
};

const rIC = function(){rb.rAFQueue(timedOutCheck, true);};

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
                rb.rAFQueue(function(){ // eslint-disable-line no-loop-func
                    element.classList.remove(observeClass);
                }, true);
                continue;
            }

            event = [{target: element, type: 'rb_layoutchange', originalEvent: e}];

            observer.cbs.fireWith(element, event);

            if(!start){
                start = Date.now();
            } else if(Date.now() - start > 3){
                elementIndex++;
                resumeElementIndex = elementIndex;
                rIC();
                return;
            }
        }
    }

    elementIndex = 0;
};

const throtteledCheckElements = rb.throttle((function(e){
    elementIndex = 0;
    checkElements(e);
}), {read: true, delay: 450});

const addEvents = function(){
    if(isInstalled){return;}
    isInstalled = true;

    observeClass = ['js', 'rb', 'layoutobserve'].join(rb.nameSeparator);
    observedElements = document.getElementsByClassName(observeClass);

    window.addEventListener('scroll', throtteledCheckElements, true);
    rb.resize.on(throtteledCheckElements);

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

rb.events.special.rb_layoutchange = {
    add: function (elem, fn, _opts) {
        let observer = elem[layoutObserveProp];

        if(!observer){
            observer = {
                cbs: $.Callbacks(),
            };

            elem[layoutObserveProp] = observer;

            rb.rAFQueue(function(){
                elem.classList.add(observeClass);
            }, true);

            addEvents();
        }

        observer.cbs.add(fn);
    },
    remove: function (elem, fn, _opts) {
        const observer = elem[layoutObserveProp];

        if(!observer){return;}

        observer.cbs.remove(fn);

        if(!observer.cbs.has()){
            delete elem[layoutObserveProp];
            rb.rAFQueue(function(){
                elem.classList.remove(observeClass);
            }, true);
        }
    },
};

rb.events.special.rb_layoutobserve = rb.events.special.rb_layoutchange;

export default rb.events.special.rb_layoutchange;
