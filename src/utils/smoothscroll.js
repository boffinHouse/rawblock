import './scrollintoview';

const rb = window.rb;
const $ = rb.$;

const smoothScroll = {
    init: function(){
        this.init = $.noop;
        Object.assign(this.defaults, rb.cssConfig.smoothScroll);
    },
    defaults: {
        easing: 'ease-in-out',
        durationMax: 1000,
        durationBase: 300,
        durationMultiplier: 0.2,
        forcePosition: true,
    },
    handler: function(anchor, event, dataAttr){
        const data = rb.jsonParse(dataAttr);
        const href = data && data.id || anchor.getAttribute('href').split('#')[1];
        const elem = href ? document.getElementById(href) : null;

        if(elem){
            this.scrollTo(elem, data);
            event.preventDefault();
        }
    },

    scrollTo: function(elem, options){
        this.init();

        $(elem).scrollIntoView(Object.assign({}, this.defaults,
            {
                focus: elem,
                hash: elem.id,
            },
            options
        ));
    },
};

rb.click.add('smoothscroll', function(anchor, event, dataAttr){
    smoothScroll.handler(anchor, event, dataAttr);
});

export default smoothScroll;
