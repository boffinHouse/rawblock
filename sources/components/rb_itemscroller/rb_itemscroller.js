(function (factory) {
    if (typeof module === 'object' && module.exports) {
        require('../../js/utils/rb_draggy');
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    /* jshint eqnull: true */
    'use strict';
    var rb = window.rb;
    var $ = rb.$;
    var regIndex = /\{index}/g;
    var supports3dTransform = window.CSS && CSS.supports && CSS.supports('(transform: translate3d(0,0,0))');

    var ItemScroller = rb.Component.extend('itemscroller',
        /** @lends rb.components.itemscroller.prototype */
        {
            /**
             * @static
             * @mixes rb.Component.prototype.defaults
             * @property {Boolean}  centerMode=false Whether cells/selected cell should be centered in scroller.
             * @property {Boolean}  carousel=false Whether scroller should be an infinite carousel.
             * @property {Number} selectedIndex=0 Initially selected index.
             * @property {Number|String} scrollStep='auto' How many cells to scroll. Either number of cells or 'view' (i.e. viewport component). 'auto' means 1 for centerMode and 'view' otherwise.
             * @property {String}  easing Easing value for the slide animation.
             * @property {Number}  duration=600 Average duration for the slide animation.
             * @property {Boolean} mouseDrag=true Whether scroller should be draggable via mouse.
             * @property {Boolean} mandatorySnap=false Whether each page generates a mandatory snap point.
             * @property {String}  paginationItemTpl The markup for the pagination buttons.
             * @property {Boolean} switchedOff=false Whether the scroller should be turned off.
             * @property {Boolean} useTransform=true Whether the scroller should use CSS transform3d or left property.
             */
            defaults: {
                switchedOff: false,
                centerMode: false,
                selectedIndex: 0,
                scrollStep: 'auto',
                mouseDrag: true,
                easing: '0.1, 0.25, 0.1, 1.03',//0.045, 0.235, 0.025, 1.025
                duration: 600,
                paginationItemTpl: '<span class="{name}-pagination-btn"></span>',
                useTransform: true,
                carousel: false,
                mandatorySnap: false,
            },
            /**
             * @constructs
             * @classdesc Class component to create a carousel/slider/itemscroller.
             * @name rb.components.itemscroller
             * @extends rb.Component
             *
             * @fires componentName#change
             * @fires componentName#changed
             * @fires componentName#changedcompleted
             * @fires componentName#pagelengthchange
             *
             * @prop {Number} pageLength Returns the page length (page length depends on item cells and scrollStep option)
             *
             * @prop {$.CallbackObject} onslide
             * @prop {Function} onslide.add Add a onslide callback function
             * @prop {Function} onslide.remove Remove a onslide callback function
             *
             * @example
             * <!--  markup example -->
             * <div class="rb-itemscroller js-rb-life" data-module="itemscroller">
             *      {{#if buttons }}
             *          <button type="button" class="itemscroller-btn-prev" tabindex="-1" aria-hidden="true">{{buttons.prev}}</button>
             *          <button type="button" class="itemscroller-btn-next" tabindex="-1" aria-hidden="true">{{buttons.next}}</button>
             *      {{/if}}
             *      <div class="itemscroller-viewport">
             *          <div class="itemscroller-content">
             *              {{#each items}}
             *                  <div class="itemscroller-cell">
             *                      <div class="dummy-item"></div>
             *                  </div>
             *              {{/each}}
             *          </div>
             *      </div>
             *      {{#if pagination}}
             *          <div class="itemscroller-pagination"></div>
             *      {{/if}}
             * </div>
             * @example
             * //combines a select element with an itemscroller
             * $('.rb-itemscroller select.itemscroller-select').each(function(){
			 *     var $itemScroller = $(this).closest('.rb-itemscroller');
			 *     var $itemSelect = $(this);
			 *     var itemscroller = $itemScroller.rbComponent();
			 *
			 *     var buildOptions = function(){
			 *          var i, option;
			 *          $itemSelect.html('');
			 *
			 *          for(i = 0; i < itemscroller.pageLength; i++){
			 *              option = document.createElement('option');
			 *              option.value = i;
			 *              option.text = i;
			 *              option.selected = i == itemscroller.selectedIndex;
			 *              $itemSelect.append(option);
			 *          }
			 *      };
			 *
			 *      $itemScroller.on('itemscrollerpagelengthchanged', buildOptions);
			 *
			 *      $itemScroller.on('itemscrollerchanged', function(){
			 *          $itemSelect.prop({selectedIndex: itemscroller.selectedIndex});
			 *      });
			 *
			 *      $itemSelect.on('change', function(){
			 *          itemscroller.selectedIndex = this.selectedIndex;
			 *      });
			 *
			 *      buildOptions();
			 * });
             */
            init: function (element) {
                this._super(element);

                this.usesTransform = this.options.useTransform && supports3dTransform;
                this._pos = 0;

                this._selectedIndex = this.options.selectedIndex;

                this.options.paginationItemTpl = this.interpolateName(this.options.paginationItemTpl);

                this.$scroller = this.$element.find('.' + this.name + '-content');
                this.scroller = this.$scroller.get(0);
                this.viewport = this.query('.{name}-viewport');
                this.$pagination = $(this.query('.{name}-pagination'));
                this.$pageLength = $(this.query('.{name}-page-length'));
                this.$currentIndex = $(this.query('.{name}-current-index'));
                this.$paginationBtns = $([]);

                this.onslide = $.Callbacks();

                this.setOption('easing', this.options.easing);
                this.setOption('duration', this.options.duration);

                this.calculateLayout = this.calculateLayout.bind(this);

                this.throttledCalculateLayout = rb.throttle(this.calculateLayout);
                this.reflow = this.throttledCalculateLayout;

                this.setPos = rb.rAF(this._setPos, {that: this, throttle: true});

                rb.rAFs(this, {throttle: true}, '_writeLayout', '_createPagination', '_switchOff', 'setSwitchedOffClass');

                this._slideProgress = this._slideProgress.bind(this);
                this._slideComplete = this._slideComplete.bind(this);

                this._setupEvents();

                if (!this.options.switchedOff) {
                    this.setOption('switchedOff', false);
                } else {
                    this.setSwitchedOffClass();
                }
            },
            events: {
                'click .{name}-btn-next': function () {
                    if (this.options.switchedOff) {
                        return;
                    }
                    if (this.isCarousel) {
                        this.selectNext();
                    } else {
                        this.selectNextIndex();
                    }
                },
                'click .{name}-btn-prev': function () {
                    if (this.options.switchedOff) {
                        return;
                    }
                    if (this.isCarousel) {
                        this.selectPrev();
                    } else {
                        this.selectPrevIndex();
                    }
                },
                'click .{name}-pagination-btn': function (e) {
                    if (this.options.switchedOff) {
                        return;
                    }
                    var index = this.$paginationBtns.index(e.delegatedTarget || e.currentTarget);
                    this.selectedIndex = index;
                },
                'elemresizewidth': 'calculateLayout',
            },
            setOption: function (name, value) {
                this._super(name, value);
                switch (name) {
                    case 'centerMode':
                    case 'scrollStep':
                    case 'carousel':
                        this._calculatePages();
                        this._writeLayout();
                        if (name == 'carousel' && value) {
                            this.$element
                                .find('.' + this.name + '-btn-next, .' + this.name + '-btn-prev')
                                .prop({disabled: false})
                                .removeClass(rb.statePrefix + 'disabled')
                            ;
                        }
                        break;
                    case 'easing':
                        this.easing = rb.addEasing(value);
                        break;
                    case 'duration':
                        this.duration = value;
                        this.maxDuration = value * 1.2;
                        this.minDuration = value / 1.2;
                        break;
                    case 'switchedOff':
                        if (value) {
                            this._switchOff();
                        } else {
                            this._switchOn();
                        }
                        break;
                }
            },
            /**
             * Returns the selected page index
             * @returns {Number}
             */
            get selectedIndex() {
                return this._selectedIndex;
            },
            /**
             * Set the selected page index.
             * @param {Number} index
             */
            set selectedIndex(index) {
                this.selectIndex(index);
            },
            _switchOff: function () {
                if ($.fn.draggy) {
                    $(this.viewport).draggy('destroy');
                }
                this.$cells
                    .css({left: '', position: ''})
                    .removeClass(rb.statePrefix + 'active-done')
                    .removeClass(rb.statePrefix + 'active')
                    .removeClass(rb.statePrefix + 'activated-done')
                    .removeClass(rb.statePrefix + 'activated')
                ;
                this.$scroller.css({
                    position: '',
                    'padding-left': '',
                    'padding-right': '',
                    left: '',
                    transform: '',
                    'min-height': '',
                });
                $(this.viewport).css({
                    position: '',
                    'border-left-width': '',
                    'border-right-width': '',
                    'border-left-style': '',
                    'border-right-style': '',
                    overflow: '',
                    height: '',
                });
                this.setSwitchedOffClass();
            },
            setSwitchedOffClass: function(){
                this.element.classList[this.options.switchedOff ? 'add' : 'remove'](rb.statePrefix + 'switched-off');
            },
            _switchOn: function () {
                this._mainSetup();
                this.updateCells();
                this._setupTouch();
                this.setSwitchedOffClass();
            },
            _mainSetup: function () {
                var that = this;
                rb.rAFQueue(function () {
                    var css = {visibility: 'hidden', position: 'absolute', 'z-index': -1};
                    if (!that.scrollerClone || !that.viewportClone) {
                        that.scrollerClone = that.scroller.cloneNode();
                        that.viewportClone = that.viewport.cloneNode();
                        $(that.scrollerClone).css(css);
                        $(that.viewportClone).css(css).addClass('js-size-shadow');
                        that.viewportClone.appendChild(that.scrollerClone);
                        $(that.viewport).after(that.viewportClone);
                    }

                    that.$scroller.css({position: 'relative', 'padding-left': '0px', 'padding-right': '0px'});
                    $(that.viewport).css({
                        position: 'relative',
                        overflow: 'hidden',
                        'border-left-color': 'transparent',
                        'border-right-color': 'transparent',
                        'border-left-style': 'solid',
                        'border-right-style': 'solid',
                    });
                    that._updateControls();
                    that._slideComplete();
                }, true);
            },
            _setupEvents: function () {
                this.element.addEventListener('load', this.throttledCalculateLayout, true);
                this._setupFocusScroll();
            },
            _setupFocusScroll: function () {
                var that = this;
                var cellSel = '.' + this.name + '-cell';
                var isTestStopped = false;
                var resetScrollLeft = function () {
                    that.viewport.scrollLeft = 0;
                };
                var scrollIntoView = function (e) {
                    var cell, pageIndex, focusedElement;
                    if (that.options.switchedOff) {
                        return;
                    }

                    if (!isTestStopped) {
                        if(e.type == 'focus'){
                            focusedElement = e.target;

                            if(!rb.root.classList.contains(rb.statePrefix + 'keyboardfocus-within')){
                                return;
                            }
                        } else {
                            focusedElement = document.activeElement;
                        }

                        if(!focusedElement || !focusedElement.closest){return;}

                        cell = focusedElement.closest(cellSel);
                        if (cell && that.isCellVisible(cell) !== true) {
                            pageIndex = that.getPageIndexOfCell(cell);
                            if(pageIndex != that._selectedIndex){
                                that.selectedIndex = pageIndex;
                            }
                        }
                    }
                    setTimeout(resetScrollLeft);
                    resetScrollLeft();
                };
                var unstopTest = function () {
                    isTestStopped = false;
                };
                var stopTest = function () {
                    if (!isTestStopped) {
                        isTestStopped = true;
                        setTimeout(unstopTest, 99);
                    }
                };

                this.scroller.addEventListener('mousedown', stopTest, true);
                this.scroller.addEventListener('touchstart', stopTest, true);
                this.scroller.addEventListener('touchend', stopTest, true);
                this.scroller.addEventListener('click', stopTest, true);
                this.scroller.addEventListener('focus', scrollIntoView, true);
                this.viewport.addEventListener('scroll', scrollIntoView);
            },
            _snapTo: function (dir, velocity, length) {
                var pageIndex;
                var fullVel = velocity + Math.abs(dir);

                length = Math.abs(length);

                if (dir && (fullVel > 33 || (fullVel > 9 && length > 99) || (fullVel > 3 && length > 200))) {

                    if (velocity > 240 && !this.options.mandatorySnap && length > 99) {
                        velocity = (velocity - 230) / 250 * this.velUnit;
                        if (dir < 0) {
                            velocity *= -1;
                        }
                    } else {
                        velocity = 0;
                    }
                    pageIndex = this[dir < 0 ? 'getNext' : 'getPrev'](velocity);
                    this.selectIndex(pageIndex);
                } else {
                    this.selectNearest();
                }
            },
            getNearest: function () {
                var prop, curDiff;
                var smallestDif = Number.MAX_VALUE;
                var index = 0;
                var pos = {
                    prev: this.getPrev() + this.baseIndex,
                    next: this.getNext() + this.baseIndex,
                };

                if (pos.next - pos.prev > 1) {
                    pos.cur = pos.next - 1;
                }

                for (prop in pos) {
                    curDiff = Math.abs(this._pos - this._getPosition(pos[prop]));
                    if (curDiff < smallestDif) {
                        smallestDif = curDiff;
                        index = pos[prop];
                    }
                }

                return index - this.baseIndex;
            },
            selectNearest: function (noAnimate) {
                return this.selectIndex(this.getNearest(), noAnimate);
            },
            _getPosition: function (index) {
                var halfWidth = (this.viewportWidth / 2);
                var curData = this.pageData[index];
                var position = curData.l;
                if (this.options.centerMode) {
                    position = halfWidth + (position * -1) - ((curData.r - position) / 2);
                } else {
                    position *= -1;
                }
                return (position || 0);
            },
            /**
             * Returns next page index from current position
             * @param [offset] {Number} Offset will be added to the current position to allow manipulations
             * @returns {number}
             */
            getNext: function (offset) {
                var i, len, cellWidth;
                var curPos = ((this._pos + (offset || 0)) * -1) + 1;
                var index = this.pageData.length - 1;


                //if(this.isWrap == 'right' && this.minWrapRight * -1 < curPos){
                //	this._setPos(curPos);
                //	return this.getNext(offset);
                //}

                for (i = 0, len = index + 1; i < len; i++) {
                    cellWidth = this._getPosition(i) * -1;
                    if (cellWidth > curPos) {
                        index = i;
                        break;
                    }
                }

                return index - this.baseIndex;
            },
            /**
             * Selects next page index based on current position data
             * @param [noAnimate] If set to true, the page index will be changed without any animations
             * @returns {Number|undefined}
             */
            selectNext: function (noAnimate) {
                return this.selectIndex(this.getNext(), noAnimate);
            },
            /**
             * Returns previous page index from current position
             * @param [offset] {Number} Offset will be added to the current position to allow manipulations
             * @returns {number}
             */
            getPrev: function (offset) {
                var cellWidth;
                var curPos = ((this._pos + (offset || 0)) * -1) - 1;
                var index = 0;
                var i = this.pageData.length - 1;

                //if(this.isWrap == 'left' && this.minUnwrapRight * -1 > curPos){
                //
                //}

                while (i >= 0) {
                    cellWidth = this._getPosition(i) * -1;
                    if (cellWidth < curPos) {
                        index = i;
                        break;
                    }
                    i--;
                }

                return index - this.baseIndex;
            },
            /**
             * Selects previous page index based on current position data
             * @param [noAnimate] If set to true, the page index will be changed without any animations
             * @returns {Number|undefined}
             */
            selectPrev: function (noAnimate) {
                return this.selectIndex(this.getPrev(), noAnimate);
            },
            /**
             * Returns page index of a specific item cell
             * @param cellIndex {Number|Element} Either the index of the cell or the cell DOM element
             * @returns {Number}
             */
            getPageIndexOfCell: function (cellIndex) {
                if (typeof cellIndex != 'number') {
                    cellIndex = this.$cells.index(cellIndex);
                }
                var cellData = this.cellData[cellIndex];
                return cellData ? cellData[cellData.isSide ? 'uIndex' : 'pageIndex'] : -1;
            },
            /**
             * Selects a specifc item cell
             * @param cellIndex {Number|Element} Either the index of the cell or the cell DOM element
             * @param [noAnimate] {Boolean|Undefined} If set to true, the page index will be changed without any animations
             */
            selectCell: function (cellIndex, noAnimate) {
                this.selectIndex(this.getPageIndexOfCell(cellIndex), noAnimate);
            },
            /**
             * Returns whether a specific cell is in scroller viewport
             * @param cellIndex {Number|Element} Either the index of the cell or the cell DOM element
             * @returns {Boolean|String} Returns either true|false or 'partial'
             */
            isCellVisible: function (cellIndex) {

                var cellData, cellLeft, cellRight, roundingTolerance;
                var inview = false;

                var viewportLeft = this._pos * -1;
                var viewportRight = viewportLeft + this.viewportWidth;
                var viewportLeftPartial = viewportLeft;
                var viewportRightPartial = viewportRight;
                if (typeof cellIndex != 'number') {
                    cellIndex = this.$cells.index(cellIndex);
                }

                cellData = this.cellData[cellIndex];
                if (cellData) {
                    roundingTolerance = (0.6 * cellIndex) + 1;
                    viewportLeft -= roundingTolerance;
                    viewportRight += roundingTolerance;
                    viewportLeftPartial += roundingTolerance;
                    viewportRightPartial -= roundingTolerance;
                    cellLeft = cellData.isSide ? cellData.ul : cellData.l;
                    cellRight = cellData.isSide ? cellData.ur : cellData.r;

                    if (viewportLeft <= cellLeft && viewportRight >= cellRight) {
                        inview = true;
                    } else if ((viewportLeftPartial <= cellLeft && viewportRightPartial >= cellLeft ) || (viewportLeftPartial <= cellRight && viewportRightPartial >= cellRight )) {
                        inview = 'partial';
                    }
                }
                return inview;
            },
            _slideProgress: function (tween, progress) {
                this._setPos((this._animEnd - this._animStart) * this.easing(progress) + this._animStart);
            },
            _slideComplete: function () {
                var curPage = this.pageData[this._selectedIndex + this.baseIndex];
                this.isAnimated = false;
                this.$cells.removeClass(rb.statePrefix + 'active-done');

                if (curPage) {
                    ( curPage.$cellElems || (curPage.$cellElems = $(curPage.cellElems)) )
                        .addClass(rb.statePrefix + 'active-done')
                        .addClass(rb.statePrefix + 'activated-done')
                    ;
                }
                this._trigger(this._evtName + 'completed');
            },
            /**
             * Selects next page index based on current index
             */
            selectNextIndex: function () {
                var index = this._selectedIndex + 1 + this.baseIndex;
                if (index < this.pageData.length) {
                    index -= this.baseIndex;
                    this.selectedIndex = index;
                }
            },

            /**
             * Selects previous page index based on current index
             */
            selectPrevIndex: function () {
                var index = this._selectedIndex - 1 + this.baseIndex;
                if (index >= 0) {
                    index -= this.baseIndex;
                    this.selectedIndex = index;
                }
            },
            /**
             * Selects a page index
             * @param index {Number} The page index, that should selected
             * @param [noAnimate] {Boolean|Undefined} If set to true, the page index will be changed without any animations
             * @returns {*|number}
             */
            selectIndex: function (index, noAnimate) {
                var trigger, duration, setPos, curIndex;
                var countIndex = index + this.baseIndex;
                if (!arguments.length || countIndex < 0 || countIndex >= this.pageData.length || !this.$cells.length) {
                    return this._selectedIndex;
                }
                if (this.options.switchedOff) {
                    return;
                }

                curIndex = this._selectedIndex || 0;
                setPos = this._getPosition(countIndex);

                if (index < 0) {
                    index = this.baseLength + index;
                } else if (index >= this.baseLength) {
                    index = index - this.baseLength;
                }

                if (!this.isCarousel) {
                    setPos = Math.max(Math.min(setPos, this.maxScroll), this.minScroll);
                }

                if (setPos != this._pos) {
                    if (curIndex != index) {
                        if (this._trigger(this._beforeEvtName, {nextIndex: index}).defaultPrevented) {
                            return this._selectedIndex;
                        }
                        trigger = true;
                        this._selectedIndex = index;
                    }

                    this._animStart = false;
                    this._animEnd = setPos;
                    this.scroller.rbItemscrollerPos = this._pos;
                    this.$scroller.stop();

                    duration = this.duration * ((setPos < this._pos) ? this._pos - setPos : setPos - this._pos) / this.viewportWidth;
                    duration = Math.max(Math.min(duration, this.maxDuration), this.minDuration);

                    if (noAnimate) {
                        this.setPos(setPos);
                        this.isAnimated = false;
                    } else {
                        this.isAnimated = true;
                        this._animStart = this._pos;
                        this.$scroller
                            .animate(
                                {
                                    rbItemscrollerPos: setPos
                                },
                                {
                                    easing: 'linear',
                                    start: this._pos,
                                    progress: this._slideProgress,
                                    duration: duration,
                                    complete: this._slideComplete,
                                }
                            );
                    }

                    this._updateControls(setPos);

                    if (trigger) {
                        this._trigger({prevIndex: curIndex});
                        if (noAnimate) {
                            this._slideComplete();
                        }
                    }
                }

                this._selectedIndex = index;
                return this._selectedIndex;
            },
            /**
             * Returns whether scroller has reached the start point
             * @param [position] {Number} If no pos is given the current position is used
             * @returns {boolean}
             */
            isStartReached: function (position) {
                if (position == null) {
                    position = this._pos;
                }
                return !this.isCarousel && position >= this.maxScroll;
            },
            /**
             * Returns whether scroller has reached the end point
             * @param [position] {Number} If no pos is given the current position is used
             * @returns {boolean}
             */
            isEndReached: function (position) {
                if (position == null) {
                    position = this._pos;
                }

                return !this.isCarousel && position <= this.minScroll;
            },
            _updateControls: function (pos) {
                var isEnd, isStart;
                var curPage = this.pageData[this._selectedIndex + this.baseIndex];

                if (!this.isCarousel) {
                    isEnd = this.isEndReached(pos);
                    isStart = this.isStartReached(pos);
                    this.$element
                        .find('.' + this.name + '-btn-next')
                        .prop({disabled: isEnd})
                        [isEnd ? 'addClass' : 'removeClass'](rb.statePrefix + 'disabled')
                    ;
                    this.$element
                        .find('.' + this.name + '-btn-prev')
                        .prop({disabled: isStart})
                        [isStart ? 'addClass' : 'removeClass'](rb.statePrefix + 'disabled')
                    ;
                }

                this.element.setAttribute('data-current-index', this._selectedIndex + 1);

                this.$currentIndex.html(this._selectedIndex + 1);

                this.$cells.removeClass(rb.statePrefix + 'active');
                if (curPage) {
                    ( curPage.$cellElems || (curPage.$cellElems = $(curPage.cellElems)) )
                        .addClass(rb.statePrefix + 'activated')
                        .addClass(rb.statePrefix + 'active')
                    ;
                }

                this.$paginationBtns
                    .removeClass(rb.statePrefix + 'selected')
                    .eq(this._selectedIndex)
                    .addClass(rb.statePrefix + 'selected')
                ;
            },
            _setupTouch: function () {
                if (!$.fn.draggy) {
                    return;
                }
                var that = this;
                var $scrollerElem = $(this.scroller);

                $(this.viewport).draggy({
                    vertical: false,

                    start: function () {
                        that.isAnimated = false;
                        $scrollerElem.stop();
                    },
                    end: function (draggy) {
                        if (!draggy.movedPos.x) {
                            that.selectNearest();
                            return;
                        }
                        var dir = draggy.lastPos.x - draggy.velPos.x;

                        if (draggy.horizontalVel < 9) {

                            dir = 0;
                            if (draggy.horizontalVel < 9 && draggy.horizontalVel < 9) {
                                draggy.allowClick();
                            }
                        }

                        that._snapTo(dir, draggy.horizontalVel, draggy.movedPos.x);
                    },
                    move: function (draggy) {
                        if (draggy.relPos.x) {
                            that._setRelPos(draggy.relPos.x * -1);
                        }
                    },
                    useMouse: this.options.mouseDrag,
                });
            },
            _setRelPos: function (relPos) {
                this.setPos(this._pos + relPos);
            },
            _changeWrap: function (side, prop) {
                var i, len, curCell;
                var cells = this.posPages[side].rbCells;

                if (prop == 'ul') {
                    this.isWrap = side;
                } else {
                    this.isWrap = '';
                }

                for (i = 0, len = cells.length; i < len; i++) {
                    curCell = cells[i];
                    curCell.isSide = this.isWrap;
                    curCell.elem.style.left = curCell[prop] + 'px';
                }
            },
            _setPos: function (pos) {
                var shouldWrapLeft, shouldWrapRight, unWrapLeft, unWrapRight;

                if (this.isCarousel) {
                    if (pos >= this.maxWrapLeft || pos <= this.minWrapRight) {
                        if (pos >= this.maxWrapLeft) {
                            pos -= this.carouselWidth;
                        } else if (pos <= this.minWrapRight) {
                            pos += this.carouselWidth;
                        }
                    }

                    shouldWrapLeft = (pos >= this.minWrapLeft && pos <= this.maxWrapLeft);
                    shouldWrapRight = (pos >= this.minWrapRight && pos <= this.maxWrapRight);
                    unWrapLeft = this.isWrap == 'left' && !shouldWrapLeft && (this.maxUnwrapLeft <= pos && this.minUnwrapLeft >= pos);
                    unWrapRight = this.isWrap == 'right' && !shouldWrapRight && (this.maxUnwrapRight <= pos && this.minUnwrapRight >= pos);//

                    if (unWrapLeft) {
                        this._changeWrap('left', 'l');
                    } else if (unWrapRight) {
                        this._changeWrap('right', 'l');
                    }

                    if (this.isWrap != 'left' && shouldWrapLeft) {
                        this._changeWrap('left', 'ul');
                    } else if (this.isWrap != 'right' && shouldWrapRight) {
                        this._changeWrap('right', 'ul');
                    }
                }

                this._pos = pos;
                this.scroller.rbItemscrollerPos = this._pos;

                if (this.usesTransform) {
                    this.scroller.style.transform = 'translate3d(' + pos + 'px, 0, 0)';
                } else {
                    this.scroller.style.left = pos + 'px';
                }
                this.onslide.fireWith(this);
            },
            updateCells: function () {
                var that = this;
                this.$cells = this.$scroller.children();
                this.calculateLayout();
                if (!this.options.switchedOff) {
                    rb.rAFQueue(function () {
                        that.$cells.css({position: 'absolute'}).addClass(that.name + '-cell');
                    });
                }
            },
            _getCellWidth: function (element) {
                return rb.getCSSNumbers(element, ['width']);
            },
            calculateLayout: function () {
                if (this.options.switchedOff) {
                    return;
                }


                if (this.cellData && (!this.scroller.offsetWidth && !this.scroller.offsetHeight)) {
                    return;
                }

                this.viewportCSS = {
                    'border-left-width': rb.getCSSNumbers(this.scrollerClone || this.scroller, ['padding-left']) + rb.getCSSNumbers(this.viewportClone || this.viewport, ['border-left-width']) + 'px',
                    'border-right-width': rb.getCSSNumbers(this.scrollerClone || this.scroller, ['padding-right']) + rb.getCSSNumbers(this.viewportClone || this.viewport, ['border-right-width']) + 'px'
                };

                this.viewportWidth = this.scroller.offsetWidth - rb.getCSSNumbers(this.scroller, ['padding-right'], true);

                if (!this.scrollerClone) {
                    this.viewportWidth -= rb.getCSSNumbers(this.scroller, ['padding-left'], true);
                }

                this._calculateCellLayout();

                this._calculatePages();

                this._writeLayout();
            },
            _calculateCellLayout: function () {
                var that = this;
                var lastWidth = 0;
                var highest = 0;

                this.cellData = this.$cells.map(function (i) {
                    var returnWidth = lastWidth;
                    var height = rb.getCSSNumbers(this, ['margin-top', 'margin-bottom', 'height'], true);
                    var width = that._getCellWidth(this);

                    lastWidth = returnWidth + width + rb.getCSSNumbers(this, ['margin-left', 'margin-right']);

                    if (height > highest) {
                        highest = height;
                    }
                    return {w: width, elem: this, r: lastWidth, l: returnWidth};
                }).get();

                this.cellData.push({l: lastWidth, w: 0, r: lastWidth, index: 'last', elem: null});
                this.highestCell = highest + rb.getCSSNumbers(this.scroller, ['padding-top', 'padding-bottom'], true);

                this.maxWrapRight = (lastWidth - this.viewportWidth) * -1;

            },
            _writeLayout: function () {
                var wasPos = this._pos;
                var that = this;

                this.scroller.style.minHeight = this.highestCell + 'px';

                this.$cells.each(function (i) {
                    this.style.left = that.cellData[i].l + 'px';
                });
                this.isWrap = '';

                $(this.viewport).css(this.viewportCSS);

                this.selectIndex(this._selectedIndex, true);

                if (this.isCarousel && wasPos == this._pos) {
                    this._setPos(wasPos);
                }
            },
            _calculatePages: function () {
                var overScrollPos;
                var halfViewport, roundingTolerance, i, len, absMinScroll, nextPageLeft, nextI, curPage, cellData;
                var scrollStep = this.options.scrollStep;
                var pageLength = this.pageLength;
                var overkillLength = 0;

                this.pageData = this.cellData;

                if (!this.$cells.length) {
                    return;
                }

                if (scrollStep == 'auto') {
                    scrollStep = (this.options.centerMode) ?
                        1 :
                        'view'
                    ;
                }

                if (scrollStep.indexOf && scrollStep.indexOf('cell') != -1) {
                    scrollStep = 1;
                }

                if (this.options.carousel || !this.options.centerMode) {
                    absMinScroll = this.maxWrapRight * -1;
                    for (i = 0; i < this.cellData.length; i++) {
                        roundingTolerance = i + 1;
                        if (this.cellData[i].l + roundingTolerance >= absMinScroll && this.cellData[i].l - roundingTolerance <= absMinScroll) {
                            this.maxWrapRight = this.cellData[i].l * -1;
                        }
                    }
                    this.minWrapLeft = 0;
                }

                if (this.options.centerMode) {
                    halfViewport = this.viewportWidth / 2;
                    this.minScroll = halfViewport + (this.cellData[this.cellData.length - 2].l * -1) - ((this.cellData[this.cellData.length - 1].l - this.cellData[this.cellData.length - 2].l || 1) / 2);
                    this.maxScroll = halfViewport - ((this.cellData[1].l || 1) / 2);
                } else {
                    this.minScroll = this.maxWrapRight;
                    this.maxScroll = this.minWrapLeft || 0;
                }

                overScrollPos = (this.minScroll * -1);

                this.pageData = [];
                nextPageLeft = 0;

                for (i = 0, len = this.cellData.length - 1; i < len; i++) {
                    roundingTolerance = (i * 0.5) + 0.5;
                    cellData = this.cellData[i];
                    if (!curPage || this.cellData[i + 1].l >= nextPageLeft + roundingTolerance) {

                        if (!this.options.centerMode && curPage && overScrollPos - roundingTolerance < curPage.l) {
                            overkillLength++;
                        }

                        curPage = {
                            l: cellData.l,
                            cells: [cellData],
                            cellElems: [cellData.elem],
                            i: curPage ? curPage.i + 1 : 0,
                        };
                        this.pageData.push(curPage);
                        nextPageLeft = cellData.l + this.viewportWidth;
                        if (scrollStep != 'view') {
                            nextI = i + scrollStep;
                            if (nextI > len) {
                                nextI = len;
                            }
                            if (nextPageLeft > this.cellData[nextI].l) {
                                nextPageLeft = this.cellData[nextI].l;
                            }
                        }
                    } else {
                        curPage.cells.push(cellData);
                        curPage.cellElems.push(cellData.elem);
                    }
                    curPage.r = this.cellData[i + 1].l;
                    this.cellData[i].pageIndex = curPage.i;
                }

                this.baseIndex = 0;
                this.baseLength = this.pageData.length;

                this.carouselWidth = this.pageData[this.baseLength - 1].r;
                this.velUnit = Math.max(Math.min(this.carouselWidth / this.baseLength, 999), 400);

                this._createCarouselPages();

                this.pageLength = this.baseLength - overkillLength;

                if (this.pageLength != pageLength) {
                    this._createPagination();
                    if (pageLength > -1) {
                        this._trigger('pagelengthchanged');
                    }
                }
            },
            _addPosCorrect: function (pageData, cells, pageCorrect, wrappedIndex) {
                var i, len, cell;
                for (i = 0, len = pageData.cells.length; i < len; i++) {
                    cell = pageData.cells[i];
                    cell.uIndex = wrappedIndex > -1 ? cell.pageIndex + wrappedIndex : wrappedIndex;
                    cell.ul = cell.l + pageCorrect;
                    cell.ur = cell.r + pageCorrect;
                    cells.push(cell);
                }
                return {
                    carouselWidth: pageCorrect,
                    ol: pageData.l,
                    or: pageData.r,
                    l: pageData.l + pageCorrect,
                    r: pageData.r + pageCorrect,
                    i: pageData.i,
                    cells: pageData.cells,
                    cellElems: pageData.cellElems,
                };
            },
            _createCarouselPages: function () {
                var i, len, pageData, curWidth, pageCorrect, negativeIndex;
                var viewport = this.viewportWidth;
                this.posPages = {left: [], right: []};
                this.posPages.right.rbCells = [];
                this.posPages.left.rbCells = [];

                this.isCarousel = this.options.carousel && (this.cellData[this.cellData.length - 1].l / 2) >= this.viewportWidth;

                if (!this.isCarousel) {
                    return;
                }

                this.maxWrapLeft = viewport;
                this.minWrapRight = this.maxWrapRight - viewport;

                pageCorrect = this.carouselWidth;

                for (i = 0, len = this.pageData.length; i < len; i++) {
                    pageData = this.pageData[i];
                    this.posPages.right.push(this._addPosCorrect(pageData, this.posPages.right.rbCells, pageCorrect, this.baseLength));
                    if (pageData.r >= viewport) {
                        break;
                    }
                }

                pageCorrect *= -1;
                negativeIndex = 0;
                for (i = this.pageData.length - 1, curWidth = 0; i >= 0; i--) {
                    pageData = this.pageData[i];
                    curWidth += pageData.r - pageData.l;
                    negativeIndex--;
                    this.posPages.left.push(this._addPosCorrect(pageData, this.posPages.left.rbCells, pageCorrect, negativeIndex));
                    if (curWidth >= viewport) {
                        break;
                    }
                }

                this.minUnwrapRight = viewport;
                this.maxUnwrapRight = (this.posPages.right[this.posPages.right.length - 1].or * -1) - viewport;

                this.minUnwrapLeft = (this.posPages.left[this.posPages.left.length - 1].ol * -1) + viewport;
                this.maxUnwrapLeft = (this.posPages.left[0].or * -1) - viewport;

                this.pageData.unshift.apply(this.pageData, this.posPages.left.reverse());
                this.pageData.push.apply(this.pageData, this.posPages.right);
                this.baseIndex = this.posPages.left.length;
            },
            _createPagination: function () {

                var paginationItems, i;
                var baseLength = this.pageLength;

                this.element.setAttribute('data-page-length', baseLength);
                this.$pageLength.html(baseLength);

                if (this.$pagination.length && this.$paginationBtns.length != baseLength) {
                    paginationItems = [];

                    for (i = 0; i < baseLength; i++) {
                        paginationItems.push(this.options.paginationItemTpl.replace(regIndex, '' + (i + 1)));
                    }
                    this.$pagination.html(paginationItems.join(''));
                    this.$paginationBtns = this.$pagination.find('.' + this.name + '-pagination-btn');
                    this.$paginationBtns.eq(this._selectedIndex).addClass(rb.statePrefix + 'selected');
                }
            },
        }
    );
    return ItemScroller;
}));
