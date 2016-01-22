(function (factory) {
    if (typeof module === 'object' && module.exports) {
        //optional require
        //require('../rb__childfx/rb__childfx');
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    /* jshint eqnull: true */
    var rb = window.rb;
    var $ = rb.$;
    var isContainerScroll = {scroll: 1, auto: 1};
    var isContainerAncestor = {parent: 'parentNode', positionedParent: 'offsetParent'};
    var docElem = document.documentElement;

    var Sticky = (rb.components._childfx || rb.Component).extend('sticky',
        /** @lends rb.components.sticky.prototype */
        {
            /**
             * @prop {{}} defaults
             * @prop {String|Boolean} container=".is-sticky-parent" The container element, that is used to calculate the bounds in wich the element should be sticky to the viewport. If `false` its always sticky. Possible values: `false`, `"parent"`(direct parent element), `"positionedParent"`, `".closest-selector"`.
             * @prop {Boolean|Number} topOffset=false If a number it sets sticky offset to the number. If neither the `topOffset` nor `bottomOffset` is set. The CSS top/bottom properties are tested. At least one of these have to have a numeric value.
             * @prop {Boolean|Number} bottomOffset=false If a number it sets sticky offset to the number. If neither the `topOffset` nor `bottomOffset` is set. The CSS top/bottom properties are tested. At least one of these have to have a numeric value.
             * @prop {Number} progress=0 Defines the distance in pixel a child animation should be added after an animation should be added.
             * @prop {''} childSel="find(.sticky-element)" The elements, which should be animated.
             * @prop {Boolean} setWidth=true Whether the width of the sticky element should be set, while it is stuck.
             * @prop {Boolean} switchedOff=false Turns off the stickyness. (to be used in responsive context).
             * @prop {Boolean} resetSwitchedOff=true Whether a switchedOff change fully resets the styles.
             * @prop {Boolean} autoThrottle=true Tries to throttle layout reads if current scroll position is far away from a changing point.
             * @prop {String} scrollContainer=''
             */
            defaults: {
                container: '.is-sticky-parent', // false || 'parent' || 'positionedParent' || '.selector'
                switchedOff: false,
                topOffset: false,
                bottomOffset: false,
                progress: 0,
                childSel: 'find(.sticky-element)',
                setWidth: true,
                resetSwitchedOff: true,
                autoThrottle: true,
                scrollContainer: '',
            },
            /**
             * @constructs
             * @classdesc Component creates a sticky element, that can be stuck to the top or the bottom of the viewport. Optionally can animate child elements after it has become stuck according to the scroll position.
             * @extends rb.components._childfx
             * @param element
             *
             * @example
             * <header class=".rb-header js-rb-life" data-module="sticky">
             *     <div class="header-fx">
             *          <img class="logo" />
             *          <nav><!-- ... --></nav>
             *      </div>
             * </header>
             *
             * <style type="text/sass">
             *     .rb-header {
			 *          (at)include exportToJS((
			 *              container: false,
			 *              progress: 100,
			 *              childSel: 'find(.header-fx)',
			 *          ));
			 *
			 *          .header-fx {
			 *              padding: 20px;
			 *              font-size: 16px;
			 *
			 *              (at)include exportToJS((
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
            init: function (element) {
                this._super(element);

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
            },
            statics: {
                filterPos: function (pos) {
                    return pos != null && pos > -1 && pos < Number.MAX_VALUE;
                },
            },
            setOption: function (name, value) {
                this._super(name, value);

                if (name == 'switchedOff' || name == 'resetSwitchedOff' && this.options.switchedOff && this.options.resetSwitchedOff) {
                    this._unfix();
                    this.updateChilds(true);
                    this.progress = -2;
                } else if (name == 'bottomOffset' || name == 'topOffset' || (name == 'switchedOff' && !value)) {
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
            },
            setSwitchedOffClass: function(){
                this.element.classList[this.options.switchedOff ? 'add' : 'remove']('is-switched-off');
            },
            _getElements: function () {
                var offsetName;

                var options = this.options;
                this.isContainerScroll = false;

                this.elemStyles = rb.getStyles(this.element);

                this.isStatic = this.elemStyles.position == 'static';

                this.posProp = (options.bottomOffset !== false || (options.topOffset === false && this.elemStyles.bottom != 'auto')) ?
                    'bottom' :
                    'top'
                ;

                offsetName = this.posProp + 'Offset';

                this.offset = 0;
                this.nativeOffset = 0;

                if (this.isStatic) {
                    this.nativeOffset = $.css(this.element, this.posProp, true, this.elemStyles) || 0;
                    this.offset -= this.nativeOffset;
                }

                if (options[offsetName] !== false) {
                    this.offset -= options[offsetName];
                }

                if (options.container) {
                    this.container = this.element[options.container] || this.element[isContainerAncestor[options.container]] || this.$element.closest(options.container).get(0);
                    if (this.container == document.body || this.container == docElem) {
                        this.container = null;
                    } else if (this.container) {
                        this.isContainerScroll = !!isContainerScroll[$.css(this.container, 'overflowY', false, this.containerStyles) || $.css(this.container, 'overflow', false, this.containerStyles)];
                        this.containerStyles = rb.getStyles(this.container);
                    }
                }

                this._setScrollingElement();

            },
            _setScrollingElement: function(){
                var curScrollingEventElement;
                var oldEventElement = this.$scrollEventElem && this.$scrollEventElem.get(0);

                if(this.options.scrollContainer){
                    this.$scrollEventElem = $(this.element).closest(this.options.scrollContainer);
                    curScrollingEventElement = this.$scrollEventElem.get(0);
                    this.scrollingElement = curScrollingEventElement;
                }

                if(!this.options.scrollContainer && this.scrollingElement){
                    if (this.isContainerScroll) {
                        this.$scrollEventElem = this.$container;
                        curScrollingEventElement = this.$container.get(0);
                        this.scrollingElement = curScrollingEventElement;
                    } else {
                        curScrollingEventElement = window;
                        this.$scrollEventElem = $(curScrollingEventElement);
                        this.scrollingElement = rb.getScrollingElement();
                    }
                }

                if(oldEventElement != curScrollingEventElement){
                    if(oldEventElement){
                        $(oldEventElement).off('scroll', this.checkPosition);
                    }
                    this.$scrollEventElem.on('scroll', this.checkPosition);
                }
            },
            calculateLayout: function () {
                var box, elemOffset, containerBox, containerOffset;

                this.minFixedPos = -1;
                this.maxFixedPos = Number.MAX_VALUE;
                this.minScrollPos = this.maxFixedPos;
                this.maxScrollPos = this.minFixedPos;

                this.scroll = this.scrollingElement.scrollTop;

                this.viewportheight = docElem.clientHeight;

                this.lastCheck = Date.now();

                box = (this.isFixed ? this.clone : this.element).getBoundingClientRect();

                if (!box.right && !box.bottom && !box.top && !box.left) {
                    return;
                }

                elemOffset = box[this.posProp] + this.scroll;

                if (this.options.setWidth) {
                    this.elemWidth = (this.isFixed ? this.clone : this.element).offsetWidth;
                }

                if (this.posProp == 'top') {
                    this.minFixedPos = elemOffset + this.offset;

                    if (this.options.progress) {
                        this.minProgressPos = this.minFixedPos;
                        this.maxProgressPos = this.minFixedPos + this.options.progress;
                    }
                } else {
                    this.maxFixedPos = elemOffset - this.offset - this.viewportheight;
                    if (this.options.progress) {
                        this.minProgressPos = this.maxFixedPos - this.options.progress;
                        this.maxProgressPos = this.maxFixedPos;
                    }
                }

                if (this.container) {
                    containerBox = this.container.getBoundingClientRect();

                    containerOffset = containerBox[this.posProp == 'top' ? 'bottom' : 'top'] + this.scroll;

                    if (this.posProp == 'top') {
                        this.maxFixedPos = containerOffset + this.offset;
                        this.minScrollPos = this.maxFixedPos - box.height -
                            $.css(this.container, 'padding-bottom', true, this.containerStyles) -
                            $.css(this.element, 'margin-bottom', true, this.elemStyles);
                        this.maxFixedPos += 9 - this.offset;
                        this.maxScrollPos = this.maxFixedPos;
                    } else {
                        this.minFixedPos = containerOffset - docElem.clientHeight - this.offset;
                        this.maxScrollPos = this.minFixedPos + box.height +
                            $.css(this.container, 'padding-top', true, this.containerStyles) +
                            $.css(this.element, 'margin-top', true, this.elemStyles);
                        this.minFixedPos += 9 + this.offset;
                        this.minScrollPos = this.minFixedPos;
                    }
                }

                this._poses = [this.minScrollPos, this.minFixedPos, this.maxFixedPos, this.maxScrollPos, this.minProgressPos, this.maxProgressPos].filter(Sticky.filterPos);

                this.checkPosition();
            },
            _isNearScroll: function (pos) {
                var dif = this.scroll - pos;
                return dif < 700 + this.viewportheight && dif > -700 - this.viewportheight;
            },
            checkPosition: function () {
                if (this.options.switchedOff) {
                    return;
                }

                var shouldFix, shouldScroll, shouldWidth, progress, wasProgress;

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

                if (shouldFix != this.isFixed || shouldScroll || this.isScrollFixed || shouldWidth) {
                    this.updateLayout(shouldFix, shouldScroll, shouldWidth);
                }

                if (
                    this.options.progress &&
                    (
                        (shouldFix && this.scroll >= this.minProgressPos && this.scroll <= this.maxProgressPos) ||
                        (this.progress !== 0 && this.progress !== 1)
                    )
                ) {
                    progress = 1 - Math.max(Math.min((this.scroll - this.minProgressPos) / (this.maxProgressPos - this.minProgressPos), 1), 0);
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
            },
            _setProgressClass: function () {
                this.element.classList[this.isProgressDone ? 'add' : 'remove'](rb.statePrefix + 'fixed-progressed');
            },
            updateLayout: function (shouldFix, shouldScroll, shouldWidth) {
                var offset, trigger;
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
                        offset = this.offset * -1;

                        if (this.posProp == 'top') {
                            offset += (this.minScrollPos - this.scroll);
                        } else {
                            offset -= this.maxScrollPos - this.scroll;
                        }

                        this.element.style[this.posProp] = offset + 'px';
                    } else if (this.isScrollFixed) {
                        this.isScrollFixed = false;
                        this.element.style[this.posProp] = (this.offset * -1) + 'px';
                    }

                } else if (this.isFixed) {
                    this._unfix();
                    trigger = true;
                }

                if (trigger) {
                    this._trigger();
                }
            },
            _unfix: function () {
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
            },
            _fix: function () {
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

                this.element.style[this.posProp] = (this.offset * -1) + 'px';
            },
            attachClone: function () {
                if (!this.$clone) {
                    this.clone = this.element.cloneNode();
                    this.$clone = $(this.clone);

                    //ToDo: remove life.initClass
                    this.$clone
                        .css({visibility: 'hidden'})
                        .removeClass(rb.life.initClass)
                        .addClass('sticky-clone')
                        .attr({
                            'data-module': '',
                            'aria-hidden': 'true',
                        })
                    ;
                }

                this.$clone.css({height: this.elemHeight + 'px',});
                this.$element.after(this.clone);
            },
            detachClone: function () {
                if (this.$clone) {
                    this.$clone.detach();
                }
            },
            attached: function () {
                rb.resize.on(this.reflow);
                clearInterval(this.layoutInterval);
                this.layoutInterval = setInterval(this.reflow, Math.round((999 * Math.random()) + 9999));
            },
            detached: function () {
                this.$scrollEventElem.off('scroll', this.checkPosition);
                rb.resize.off(this.reflow);
                clearInterval(this.layoutInterval);
                this.$scrollEventElem = null;
            },
        }
    );

    if (!rb.components._childfx) {
        rb.log('_childfx not included');
    }

    return Sticky;
}));
