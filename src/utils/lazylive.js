import './intersect';


let started, observeClass, observedElements, initClass, clickClass;

const rb = window.rb;
const $ = rb.$;
const intersect = rb.events.special.rb_intersect;

const onIntersect = function (e) {
    const element = e.target;

    intersect.remove(element, onIntersect, {margin: 666});

    initComponent(element);
};


const observe = function(){
    if(observedElements.length){
        const elements = Array.from(observedElements);

        elements.forEach((element)=>{
            intersect.add(element, onIntersect, {margin: 666});
        });

        $(elements).removeClassRaf(observeClass);
    }
};

const throttleObserve = rb.throttle(observe);

function initComponent(element){
    const module = element.getAttribute('data-module');

    if(rb.components[module]){
        rb.ready.then(()=>{
            rb.getComponent(element, module);
        });
    } else {
        const loadModule = element.getAttribute('data-loadmodule') != null;

        if(!element.classList.contains(initClass) && !element.classList.contains(clickClass)){
            $(element).addClassRaf(initClass);
        }

        rb.live.import(module, element, !loadModule);
    }

    $(`[data-module="${module}"].${clickClass}.${observeClass}`).removeClassRaf(observeClass);
}

function start(){
    if(started){return;}
    started = true;

    const nameSeparator = rb.cssConfig.nameSeparator || rb.nameSeparator;

    observeClass = ['js', 'rb', 'lazylive'].join(nameSeparator);
    initClass = ['js', 'rb', 'live'].join(nameSeparator);
    clickClass = ['js', 'rb', 'click'].join(nameSeparator);

    observedElements = document.getElementsByClassName(observeClass);

    if(window.MutationObserver){
        new MutationObserver( throttleObserve ).observe( rb.root, {childList: true, subtree: true, attributes: true, attributeFilter: ['class']} );
    } else {
        rb.root.addEventListener('DOMNodeInserted', throttleObserve, true);
        rb.root.addEventListener('DOMAttrModified', throttleObserve, true);
        setInterval(throttleObserve, 999);
    }

    observe();
}

rb.ready.then(start);

rb.startLazyModules = start;

export default start;
