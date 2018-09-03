import rb, { Component } from '../core';
import getCss from '../utils/get-css';

const $ = Component.$;
const isContainerScroll = {scroll: 1, auto: 1};
const isContainerAncestor = {parent: 'parentNode', positionedParent: 'offsetParent'};
const docElem = document.documentElement;

if (!rb.components._childfx) {
    rb.log('_childfx not included');
}

/**
 * Component creates a sticky element, that can be stuck to the top or the bottom of the viewport. Optionally can animate child elements after it has become stuck according to the scroll position.
 *
 * @alias rb.components.sticky
 *
 * @extends rb.components._childfx
 *
 * @param element
 * @param initialDefaults
 *
 *
 *
 * @example
 * <header class="rb-header js-rb-live" data-module="sticky">
 *     <div class="header-fx">
 *          <img class="logo" />
 *          <nav><!-- ... --></nav>
 *      </div>
 * </header>
 *
 * <style type="text/scss">
 *     .rb-header {
 *          (at)include rb-js-export((
 *              container: false,
 *              progress: 100,
 *              childSel: 'find(.header-fx)',
 *          ));
 *
 *          .header-fx {
 *              padding: 20px;
 *              font-size: 16px;
 *
 *              (at)include rb-js-export((
 *                  fontSize: 12,
 *                  paddingTop: 10,
 *                  paddingBottom: 10
 *              ));
 *          }
 *
 *          .logo,
 *          nav {
 *              height: 1em;
 *          }
 *     }
 * </style>
 */
class Sticky extends (rb.components._childfx || Component) {
    /**
     * @mixes rb.components._childfx.defaults
     *
     * @prop {String|Boolean} container=".is{-}{name}{-}parent" The container element, that is used to calculate the bounds in which the element should be sticky to the viewport. If `false` its always sticky. Possible values: `false`, `"parent"`(direct parent element), `"positionedParent"`, `".closest-selector"`.
     * @prop {Boolean|Number} topOffset=false If a number/string it sets sticky offset to the number.
     * @prop {Boolean|Number} bottomOffset=false If a number/string it sets sticky offset to the number.
     * @prop {String} offsetElements="" The height of these elements will be added to the calculated top or bottom offset. The elements are retrieved by `this.getElementsByString`.
     * @prop {String} marginBottomElements="" The height of these elements will be added to the calculated top or bottom offset. The elements are retrieved by `this.getElementsByString`.
     * @prop {Number} progress=0 Defines the distance in pixel a child animation should be added after an animation should be added.
     * @prop {Boolean} setWidth=true Whether the width of the sticky element should be set, while it is stuck.
     * @prop {Boolean} switchedOff=false Turns off the stickyness. (to be used in responsive context).
     * @prop {Boolean} resetSwitchedOff=true Whether a switchedOff change fully resets the styles.
     * @prop {Boolean} autoThrottle=true Tries to throttle layout reads if current scroll position is far away from a changing point.
     * @prop {String} scrollContainer=''
     */
    static get defaults(){
        return {
            container: '.is{-}{name}{-}parent', // false || 'parent' || 'positionedParent' || '.selector'
            switchedOff: false,
            topOffset: false,
            bottomOffset: false,
            offsetElements: '',
            progress: 0,
            setWidth: true,
            resetSwitchedOff: true,
            autoThrottle: true,
            scrollContainer: '',
        };
    }

    static filterPos(pos) {
        return pos != null && pos > -1 && pos < Number.MAX_VALUE;
    }

    constructor(element, initialDefaults){
        super(element, initialDefaults);

        this.isFixed = false;
        this.isScrollFixed = false;
        this.checkTime = 666 + (666 * Math.random());

        this.isProgressDone = false;
        this.onprogress = $.Callbacks();

        this._throttleOptions = {that: this, unthrottle: true};

        this.updateChilds = this.updateChilds || $.noop;

        this.onprogress.fireWith = rb.rAF(this.onprogress.fireWith, {throttle: true});

        rb.rAFs(this, {throttle: true}, 'updateLayout', '_setProgressClass', 'setSwitchedOffClass');

        this.calculateLayout = this.calculateLayout.bind(this);
        this.checkPosition = rb.throttle(this.checkPosition, this._throttleOptions);

        this.reflow = rb.throttle(function () {
            if (this.checkChildReflow) {
                this.checkChildReflow();
            }
            this.calculateLayout();
        }, {that: this});


        this._getElements();
        this.calculateLayout();

        if(this.options.switchedOff){
            this.setSwitchedOffClass();
        }
    }

    setOption(name, value, isSticky) {
        super.setOption(name, value, isSticky);

        if (name == 'switchedOff' || name == 'resetSwitchedOff' && this.options.switchedOff && this.options.resetSwitchedOff) {
            this._unfix();
            this.updateChilds(true);
            this.progress = -2;
        } else if (name == 'offsetElements' || name == 'bottomOffset' || name == 'topOffset' || (name == 'switchedOff' && !value)) {
            this._unfix();
            this.element.style.top = '';
            this.element.style.bottom = '';
            this._getElements();
            this.calculateLayout();
        } else if (name == 'autoThrottle' && !value && !this._throttleOptions.unthrottle) {
            this._throttleOptions.unthrottle = true;
        } else if(name == 'scrollContainer'){
            this._setScrollingElement();
        }

        if(name == 'switchedOff'){
            this.setSwitchedOffClass();
        }
    }

    setSwitchedOffClass(){
        this.element.classList.toggle(rb.statePrefix + 'switched' + rb.nameSeparator + 'off', this.options.switchedOff);
    }

    _getElements() {
        let offsetName;

        const options = this.options;
        this.isContainerScroll = false;

        this.elemStyles = rb.getStyles(this.element);

        this.offsetElements = options.offsetElements ?
            this.getElementsByString(options.offsetElements) :
            []
        ;

        this.posProp = (options.bottomOffset !== false) ?
            'bottom' :
            'top'
        ;

        offsetName = this.posProp + 'Offset';

        this.offset = 0;

        if (options[offsetName] !== false) {
            this.offset -= options[offsetName];
        }

        if (options.container) {
            this.container = this.element[options.container] || this.element[isContainerAncestor[options.container]] || this.element.closest(this.interpolateName(options.container));
            if (this.container == document.body || this.container == docElem) {
                this.container = null;
            } else if (this.container) {
                this.isContainerScroll = !!isContainerScroll[getCss(this.container, 'overflowY', false, this.containerStyles) || getCss(this.container, 'overflow', false, this.containerStyles)];
                this.containerStyles = rb.getStyles(this.container);
            }
        }

        this.calcedOffset = this.offset;

        this._setScrollingElement();
    }

    _setScrollingElement(){
        let curScrollingEventElement;
        const oldEventElement = this.$scrollEventElem && this.$scrollEventElem.get(0);

        if(this.options.scrollContainer){
            this.$scrollEventElem = $(this.element).closest(this.options.scrollContainer);
            curScrollingEventElement = this.$scrollEventElem.get(0);
            this.scrollingElement = curScrollingEventElement;
        }

        if(!this.options.scrollContainer || !this.scrollingElement){
            if (this.isContainerScroll) {
                this.$scrollEventElem = this.$container;
                curScrollingEventElement = this.$container.get(0);
                this.scrollingElement = curScrollingEventElement;
            } else {
                curScrollingEventElement = window;
                this.$scrollEventElem = $(curScrollingEventElement);
                this.scrollingElement = document.scrollingElement;
            }
        }

        if(oldEventElement != curScrollingEventElement){
            if(oldEventElement){
                $(oldEventElement).off('scroll', this.checkPosition);
            }
            this.$scrollEventElem.on('scroll', this.checkPosition);
        }
    }

    getCalculatedLayout(){
        let box, elemOffset, containerBox, containerOffset;

        const boxes = {
            minFixedPos: -1,
            maxFixedPos: Number.MAX_VALUE,
            minScrollPos: -1,
            maxScrollPos: Number.MAX_VALUE,
        };

        box = (this.isFixed ? this.clone : this.element).getBoundingClientRect();

        if (!box.right && !box.bottom && !box.top && !box.left) {
            return boxes;
        }

        elemOffset = box[this.posProp] + this.scroll;

        if(this.offsetElements.length){
            this.calcedOffset = this.offset - this.offsetElements.reduce((prevValue, element) => prevValue + element.offsetHeight, 0);
        }

        if (this.options.setWidth) {
            this.elemWidth = (this.isFixed ? this.clone : this.element).offsetWidth;
        }

        if (this.posProp == 'top') {
            boxes.minFixedPos = elemOffset + this.calcedOffset;

            if (this.options.progress) {
                boxes.minProgressPos = boxes.minFixedPos;
                boxes.maxProgressPos = boxes.minFixedPos + this.options.progress;
            }
        } else {
            boxes.maxFixedPos = elemOffset - this.calcedOffset - this.viewportheight;

            if (this.options.progress) {
                boxes.minProgressPos = boxes.maxFixedPos - boxes.options.progress;
                boxes.maxProgressPos = boxes.maxFixedPos;
            }
        }

        if (this.container) {
            containerBox = this.container.getBoundingClientRect();

            containerOffset = containerBox[this.posProp == 'top' ? 'bottom' : 'top'] + this.scroll;

            if (this.posProp == 'top') {
                boxes.maxFixedPos = containerOffset + this.calcedOffset;

                boxes.minScrollPos = boxes.maxFixedPos - box.height -
                    getCss(this.container, 'padding-bottom', true, this.containerStyles) -
                    getCss(this.element, 'margin-bottom', true, this.elemStyles);
                boxes.maxFixedPos += 9 - this.calcedOffset;
                boxes.maxScrollPos = boxes.maxFixedPos;
            } else {
                boxes.minFixedPos = containerOffset - docElem.clientHeight - this.calcedOffset;
                boxes.maxScrollPos = boxes.minFixedPos + box.height +
                    getCss(this.container, 'padding-top', true, this.containerStyles) +
                    getCss(this.element, 'margin-top', true, this.elemStyles);
                boxes.minFixedPos += 9 + this.calcedOffset;
                boxes.minScrollPos = boxes.minFixedPos;
            }
        }

        return boxes;
    }

    calculateLayout() {

        this.scroll = this.scrollingElement.scrollTop;

        this.viewportheight = docElem.clientHeight;

        this.lastCheck = Date.now();

        Object.assign(this, this.getCalculatedLayout());

        this._poses = [this.minScrollPos, this.minFixedPos, this.maxFixedPos, this.maxScrollPos, this.minProgressPos, this.maxProgressPos].filter(Sticky.filterPos);

        this.checkPosition();
    }

    _isNearScroll(pos) {
        const dif = this.scroll - pos;
        return dif < 700 + this.viewportheight && dif > -700 - this.viewportheight;
    }

    checkPosition() {
        if (this.options.switchedOff) {
            return;
        }

        let shouldFix, shouldScroll, shouldWidth, progress, wasProgress;

        this.scroll = this.scrollingElement.scrollTop;

        if (Date.now() - this.lastCheck > this.checkTime) {
            this.calculateLayout();
            return;
        }

        shouldFix = this.scroll >= this.minFixedPos && this.scroll <= this.maxFixedPos;
        shouldScroll = shouldFix && (this.scroll >= this.minScrollPos && this.scroll <= this.maxScrollPos);

        if (this.options.autoThrottle) {
            this._throttleOptions.unthrottle = this._poses.some(this._isNearScroll, this);
        }

        if (shouldFix && !this.isFixed) {
            this.elemHeight = this.element.offsetHeight;
            if (this.options.setWidth) {
                this.elemWidth = this.element.offsetWidth;
            }
        }

        shouldWidth = shouldFix && this.isFixed && this.options.setWidth && this.element.offsetWidth != this.elemWidth;

        if (shouldFix != this.isFixed || shouldScroll || this.isScrollFixed || shouldWidth || (this.isFixed && this._setCalcedOffset != this.calcedOffset)) {
            this.updateLayout(shouldFix, shouldScroll, shouldWidth);
        }

        if (
            this.options.progress &&
            (
                (shouldFix && this.scroll >= this.minProgressPos && this.scroll <= this.maxProgressPos) ||
                (this.progress !== 0 && this.progress !== 1)
            )
        ) {
            progress = Math.max(Math.min((this.scroll - this.minProgressPos) / (this.maxProgressPos - this.minProgressPos), 1), 0);
            wasProgress = this.progress;

            if (!shouldFix && wasProgress == -2) {
                return;
            }

            if (wasProgress != progress) {
                this.progress = progress;

                if (progress == 1) {
                    if (!this.isProgressDone) {
                        this.isProgressDone = true;
                        this._setProgressClass();
                    }
                } else if (this.isProgressDone) {
                    this.isProgressDone = false;
                    this._setProgressClass();
                }

                this.updateChilds();
                this.onprogress.fireWith(this, [progress]);
            }
        }
    }

    _setProgressClass() {
        this.element.classList.toggle(rb.statePrefix + 'fixed' + rb.nameSeparator + 'progressed', this.isProgressDone);
    }

    updateLayout(shouldFix, shouldScroll, shouldWidth) {
        let offset, trigger;

        if (this.options.switchedOff) {
            return;
        }

        if (shouldWidth) {
            this.element.style.width = this.elemWidth + 'px';
        }

        if (shouldFix) {
            if (!this.isFixed) {
                this._fix();
                trigger = true;
            }

            if (shouldScroll) {
                this.isScrollFixed = true;
                offset = this.calcedOffset * -1;

                if (this.posProp == 'top') {
                    offset += (this.minScrollPos - this.scroll);
                } else {
                    offset -= this.maxScrollPos - this.scroll;
                }

                this.element.style[this.posProp] = offset + 'px';
            } else if (this.isScrollFixed || this._setCalcedOffset != this.calcedOffset) {
                this.isScrollFixed = false;
                this.element.style[this.posProp] = (this.calcedOffset * -1) + 'px';
            }

        } else if (this.isFixed) {
            this._unfix();
            trigger = true;
        }

        this._setCalcedOffset = this.calcedOffset;

        if (trigger) {
            this.trigger();
        }
    }

    _unfix() {
        if (!this.isFixed) {
            return;
        }

        this.isFixed = false;
        this.isScrollFixed = false;
        this.element.classList.remove(rb.statePrefix + 'fixed');
        this.detachClone();
        this.element.style.position = '';
        this.element.style.width = '';
        this.element.style[this.posProp] = '';
    }

    _fix() {
        if (this.isFixed) {
            return;
        }
        this.isFixed = true;
        this.isScrollFixed = false;
        this.attachClone();
        this.element.classList.add(rb.statePrefix + 'fixed');
        this.element.style.position = 'fixed';

        if (this.options.setWidth) {
            this.element.style.width = this.elemWidth + 'px';
        }

        this.element.style[this.posProp] = (this.calcedOffset * -1) + 'px';
    }

    attachClone() {
        if (!this.$clone) {
            this.clone = this.element.cloneNode();
            this.$clone = $(this.clone);

            this.$clone
                .css({visibility: 'hidden'})
                .removeClass('js' + rb.nameSeparator + 'rb' + rb.nameSeparator + 'live')
                .addClass('js' + rb.nameSeparator + 'sticky' + rb.nameSeparator + 'clone')
                .attr({
                    'data-module': '',
                    'aria-hidden': 'true',
                })
            ;
        }

        this.$clone.css({height: this.elemHeight + 'px'});
        this.$element.after(this.clone);
    }

    detachClone() {
        if (this.$clone) {
            this.$clone.detach();
        }
    }

    attached() {
        this._setScrollingElement();
        rb.resize.on(this.reflow);
        clearInterval(this.layoutInterval);
        this.layoutInterval = setInterval(this.reflow, Math.round((999 * Math.random()) + 9999));
    }

    detached() {
        this.$scrollEventElem.off('scroll', this.checkPosition);
        rb.resize.off(this.reflow);
        clearInterval(this.layoutInterval);
        this.$scrollEventElem = null;
    }
}

export default Component.register('sticky', Sticky);
