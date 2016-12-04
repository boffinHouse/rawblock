let added, scrollbarWidth;

const rb = window.rb;
const $ = rb.$;

let scrollbarDiv = document.createElement('div');

const setStyle = rb.rAF(function(){
    const size = scrollbarWidth || 0;
    const className = rb.statePrefix + 'scrollbarwidth' + rb.nameSeparator + Math.round(size);

    rb.root.style.setProperty('--rb-scrollbar-width', size + 'px', '');

    rb.root.classList.add(className);

    scrollbarDiv.remove();
    scrollbarDiv = null;
}, {throttle: true});

const read = function(){
    if(scrollbarWidth == null){
        scrollbarWidth = scrollbarDiv.offsetWidth - scrollbarDiv.clientWidth;
        rb.ready.then(setStyle);
    }
};

const add = function(){
    if(!added){
        added = true;
        scrollbarDiv.className = 'js' + rb.nameSeparator + 'rb' + rb.nameSeparator + 'scrollbarobserve';
        (document.body || rb.root).appendChild(scrollbarDiv);
        rb.rIC(read);
    }
};

const getWidth = function(){
    if(scrollbarWidth == null){
        add();
        read();
    }
    return scrollbarWidth;
};


$(scrollbarDiv).css({
    width: '99px',
    height: '99px',
    paddingLeft: '0px',
    paddingRight: '0px',
    borderLeftWidth: '0px',
    borderRightWidth: '0px',
    overflow: 'scroll',
    position: 'absolute',
    visibility: 'hidden',
    top: '0px',
    left: '0px',
    zIndex: '-1',
});

rb.rAFQueue(add);

Object.defineProperty(rb, 'scrollbarWidth', {
    get: getWidth,
    enumerable: true,
    configurable: true,
});

export default getWidth;
