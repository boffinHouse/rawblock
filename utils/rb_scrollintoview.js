const regHash = /^#/;
const $ = window.rb.$ || window.jQuery;
/**
 * A jQuery/rb.$ plugin to scroll an element into the viewort
 * @function external:"jQuery.fn".scrollIntoView
 * @param options {object} All jQuery animate options and additional options
 * @param options.focus {Element} Element that should be focused after animation is done.
 * @param options.hash {String} Hash to set on the location object
 * @param options.scrollingElement {Element}
 * @param options.durationBase=350 {Number}
 * @param options.durationMax=700 {Number}
 * @param options.durationMultiplier=0.2 {Number}
 *
 * @returns {jQueryfiedDOMList}
 */
$.fn.scrollIntoView = function (options) {
    let bbox, distance, scrollingElement, opts, focus, pos;
    const elem = this.get(0);

    if (elem) {
        options = options || {};
        bbox = elem.getBoundingClientRect();
        distance = Math.max(Math.abs(bbox.top), Math.abs(bbox.left));
        scrollingElement = options.scrollingElement || rb.getPageScrollingElement();
        pos = {
            scrollTop: bbox.top + (options.offsetTop || 0),
            scrollLeft: bbox.left + (options.offsetLeft || 0),
        };

        if(!options.scrollingElement || options.scrollingElement.contains(elem)){
            pos.scrollTop += scrollingElement.scrollTop;
            pos.scrollLeft += scrollingElement.scrollLeft;
        }

        if (options.easing) {
            rb.addEasing(options.easing);
        }

        if (!options.duration) {
            options.duration = Math.min(options.durationMax || 700, (options.durationBase || 350) + (distance * (options.durationMultiplier || 0.2)));
        }

        opts = Object.assign({}, options, {

            always: function () {
                let top, left, hash;

                if (options.forcePosition) {
                    top = scrollingElement.scrollTop;
                    left = scrollingElement.scrollLeft;
                }

                if ( (focus = options.focus) ) {
                    if(typeof focus == 'string'){
                        focus = regHash.test(focus) ? document.querySelector(focus) : document.getElementById(focus);
                    }

                    if(focus){
                        rb.setFocus(focus);
                    }
                }

                if (options.hash) {
                    hash =  typeof options.hash == 'string' ?
                        options.hash :
                    elem.id || elem.name
                    ;

                    if(hash){
                        location.hash = hash;
                    }
                }

                if (options.forcePosition) {
                    scrollingElement.scrollTop = top;
                    scrollingElement.scrollLeft = left;
                }

                if (options.always) {
                    options.always.call(elem);
                }
            },
        });

        $(scrollingElement).animate(
            pos,
            opts
        );
    }

    return this;
};

export default $.fn.scrollIntoView;
