(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '../utils/rb_draggy', '../utils/rb_wheelanalyzer', '../utils/rb_resize', '../utils/rb_prefixed', '../utils/rb_debounce'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('../utils/rb_draggy'), require('../utils/rb_wheelanalyzer'), require('../utils/rb_resize'), require('../utils/rb_prefixed'), require('../utils/rb_debounce'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.rb_draggy, global.rb_wheelanalyzer, global.rb_resize, global.rb_prefixed, global.rb_debounce);
        global.itemscroller = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var rb = window.rb;
    var $ = rb.$;
    var regIndex = /\{index}/g;
    var orderProp = rb.prefixed('order') || rb.prefixed('flexOrder');
    var supportSomeOrder = !!orderProp;
    var transformProp = rb.prefixed('transform');
    var supports3dTransform = rb.cssSupports('transform', 'translate3d(0,0,0)');

    /**
     * Class component to create a carousel/slider/itemscroller.
     * @alias rb.components.itemscroller
     *
     * @param element
     * @param initialDefaults
     *
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
     * <div class="rb-itemscroller js-rb-live" data-module="itemscroller">
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

    var ItemScroller = function (_rb$Component) {
        _inherits(ItemScroller, _rb$Component);

        _createClass(ItemScroller, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    switchedOff: false,
                    centerMode: false,
                    selectedIndex: 0,
                    scrollStep: 'auto',
                    mouseDrag: true,
                    dragExclude: false,
                    easing: 'ease-in-out', //0.045, 0.235, 0.025, 1.025
                    dragEasing: '0.1, 0.25, 0.1, 1.03', //0.045, 0.235, 0.025, 1.025
                    duration: 600,
                    paginationItemTpl: '<span class="{name}{e}pagination{-}btn"></span>',
                    excludeCell: false,
                    excludeHiddenCells: true,
                    useTransform: true,
                    carousel: false,
                    mandatorySnap: false,
                    startOrder: -1,
                    endOrder: 99,
                    usePx: false,
                    wheel: true,
                    wheelVelocityMultiplier: 0.2
                };
            }
        }]);

        function ItemScroller(element, initialDefaults) {
            _classCallCheck(this, ItemScroller);

            var _this = _possibleConstructorReturn(this, _rb$Component.call(this, element, initialDefaults));

            _this.usesTransform = _this.options.useTransform && !!transformProp;
            _this._pos = 0;

            _this._selectedIndex = _this.options.selectedIndex;

            _this.scroller = _this.query('.{name}{e}content');
            _this.$scroller = $(_this.scroller);
            _this.viewport = _this.query('.{name}{e}viewport');
            _this.$pagination = $(_this.query('.{name}{e}pagination'));
            _this.$pageLength = $(_this.query('.{name}{e}page{-}length'));
            _this.$currentIndex = $(_this.query('.{name}{e}current{-}index'));
            _this.$paginationBtns = $([]);

            _this.onslide = $.Callbacks();

            _this.setOption('easing', _this.options.easing);
            _this.setOption('dragEasing', _this.options.dragEasing);
            _this.setOption('duration', _this.options.duration);

            _this.calculateLayout = _this.calculateLayout.bind(_this);

            _this.throttledCalculateLayout = rb.throttle(_this.calculateLayout);
            _this.reflow = _this.throttledCalculateLayout;

            _this.setPos = rb.rAF(_this._setPos, { that: _this, throttle: true });

            rb.rAFs(_this, { throttle: true }, '_writeLayout', '_createPagination', '_switchOff', 'setSwitchedOffClass', '_updateControls');

            _this._slideProgress = _this._slideProgress.bind(_this);
            _this._slideComplete = _this._slideComplete.bind(_this);
            _this._dragStart = _this._dragStart.bind(_this);
            _this._dragEnd = _this._dragEnd.bind(_this);
            _this._dragMove = _this._dragMove.bind(_this);

            _this._generateHelper();
            _this._setupEvents();

            if (!_this.options.switchedOff) {
                _this.setOption('switchedOff', false);
            } else {
                _this.setSwitchedOffClass();
            }
            return _this;
        }

        ItemScroller.prototype.setOption = function setOption(name, value, isSticky) {
            _rb$Component.prototype.setOption.call(this, name, value, isSticky);

            switch (name) {
                case 'centerMode':
                case 'scrollStep':
                case 'carousel':
                    this._calculatePages();
                    this._writeLayout();
                    if (name == 'carousel' && value) {
                        this.$queryAll('.{name}{e}btn{-}next, .{name}{e}btn{-}prev').prop({ disabled: false }).removeClass(rb.statePrefix + 'disabled');
                    }
                    break;
                case 'easing':
                    this._easing = rb.addEasing(value);
                    this.easing = this._easing;
                    break;
                case 'dragEasing':
                    this._dragEasing = rb.addEasing(value);
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
                case 'excludeCell':
                case 'excludeHiddenCells':
                    this.updateCells();
                    break;
            }
        };

        ItemScroller.prototype._switchOff = function _switchOff() {
            if ($.fn.draggy) {
                $(this.viewport).draggy('destroy');
            }

            var cellCSS = {};

            this.$cells.rbChangeState('active{-}done').rbChangeState('active').rbChangeState('activated{-}done').rbChangeState('activated');

            cellCSS[orderProp] = '';

            this.$cells.css(cellCSS);

            this.$scroller.css({
                position: '',
                left: '',
                transform: ''
            });

            $(this.viewport).css({
                position: ''
            });

            this.helperElem.style.display = 'none';

            // reset pagination
            this.$pagination.html('');
            this.$paginationBtns = $([]);

            this.setSwitchedOffClass();
        };

        ItemScroller.prototype.addWheel = function addWheel() {
            if (!this.options.wheel || !rb.debounce) {
                return;
            }

            var startValue;
            var that = this;
            var _isWheelStarted = false;
            var isScrollerDir = null;
            var options = this.options;

            var wheelAnalyzer = rb.WheelAnalyzer();
            var momentumBlocked = false;

            var unblockMomentum = function unblockMomentum() {
                momentumBlocked = false;
                reset();
            };

            var reset = function reset() {
                _isWheelStarted = false;
                isScrollerDir = null;
            };

            var wheelDirEnd = function wheelDirEnd() {
                // prevent normal wheelEnd, when momentum is handled
                if (momentumBlocked) {
                    return;
                }

                var nearestIndex = that.getNearest();
                var diff = that._pos - startValue;
                var threshold = Math.min(Math.max(that.viewportWidth / 4, 150), 300);

                reset();

                if (nearestIndex != that._selectedIndex || Math.abs(diff) < threshold) {
                    that.selectedIndex = nearestIndex;
                } else if (diff > 0) {
                    that.selectPrev();
                } else {
                    that.selectNext();
                }
            };

            var wheelDirEndDebounced = rb.debounce(wheelDirEnd, { delay: 77 });
            var wheelEndDebounced = rb.debounce(reset, { delay: 99 });

            var wheelHandler = function wheelHandler(e) {
                var x, y;

                if (!e.deltaMode && !options.switchedOff && options.wheel && !e.defaultPrevented) {

                    if (isScrollerDir !== false) {
                        x = Math.abs(e.deltaX);
                        y = Math.abs(e.deltaY);

                        if (isScrollerDir == null && x != y) {
                            isScrollerDir = x > y;
                        }

                        if (x >= y || x) {

                            wheelAnalyzer.feedWheel(e);

                            if (!momentumBlocked) {
                                if (!_isWheelStarted) {
                                    _isWheelStarted = true;
                                    startValue = that._pos;
                                    $(that.scroller).stop();
                                }

                                that._setRelPos(e.deltaX * -1, true);
                                wheelDirEndDebounced();
                            }

                            e.preventDefault();
                        }
                    } else {
                        wheelEndDebounced();
                    }
                }
            };

            var uninstallWheelHandler = function uninstallWheelHandler() {
                that.viewport.removeEventListener('wheel', wheelHandler);
            };

            var installWheelHandler = rb.debounce(function () {
                if (!options.switchedOff && options.wheel && that.viewport.matches(':hover')) {
                    that.viewport.addEventListener('wheel', wheelHandler);
                }
            }, { delay: 66 });

            that.viewport.addEventListener('mouseleave', uninstallWheelHandler);
            that.viewport.addEventListener('mouseenter', installWheelHandler);

            installWheelHandler();

            //unblock direct user interaction, when momentum ended or is interrupted
            wheelAnalyzer.subscribe('ended', unblockMomentum).subscribe('interrupted', unblockMomentum).subscribe('recognized', function (data) {
                momentumBlocked = true;

                reset();

                // from px/s -> px/300ms
                var velocity = data.deltaVelocity / 1000 * 300 * -1;
                var totalLengthMovedByWheel = data.deltaTotal;

                //tune down velocity for snap from wheel
                velocity = velocity * that.options.wheelVelocityMultiplier;

                // dir, veloX, length
                that._snapTo(velocity < 0 ? -1 : 1, Math.abs(velocity), totalLengthMovedByWheel * 0.25);
            });
        };

        ItemScroller.prototype.setSwitchedOffClass = function setSwitchedOffClass() {
            this.element.classList.toggle(rb.statePrefix + 'switched' + rb.nameSeparator + 'off', this.options.switchedOff);
        };

        ItemScroller.prototype._switchOn = function _switchOn() {
            this.updateCells();
            this._setupTouch();
            this._mainSetup();
            this._createPagination();
            this.setSwitchedOffClass();
        };

        ItemScroller.prototype._generateHelper = function _generateHelper() {

            this.helperElem = $(document.createElement('div')).attr({
                'class': 'js' + rb.nameSeparator + this.name + rb.elementSeparator + 'helper',
                style: 'width:0;padding:0;margin:0;visibility:hidden;border:0;height:100%;min-height:9px'
            }).css({
                webkitFlexGrow: 0,
                flexGrow: 0,
                display: this.options.switchedOff ? 'none' : ''
            }).get(0);

            this._setOrder(this.helperElem, this.options.startOrder);
        };

        ItemScroller.prototype._mainSetup = function _mainSetup() {
            var that = this;

            rb.rAFQueue(function () {
                $(that.viewport).css({
                    position: 'relative'
                });
                that.$scroller.css({
                    position: 'relative'
                });

                that.helperElem.style.display = '';

                that._updateControls();
                that._slideComplete();
            }, true);
        };

        ItemScroller.prototype._setupEvents = function _setupEvents() {
            this._setupFocusScroll();
            this.addWheel();
        };

        ItemScroller.prototype._setupFocusScroll = function _setupFocusScroll() {
            var that = this;
            var cellSel = '.' + this.name + rb.elementSeparator + 'cell';
            var isTestStopped = false;
            var keyboardFocusClass = rb.utilPrefix + 'keyboardfocus' + rb.nameSeparator + 'within';
            var evtOpts = { capture: true, passive: true };
            var resetScrollLeft = function resetScrollLeft() {
                that.viewport.scrollLeft = 0;
            };
            var scrollIntoView = function scrollIntoView(e) {
                var cell, pageIndex, focusedElement;
                if (that.options.switchedOff) {
                    return;
                }

                if (!isTestStopped) {
                    if (e.type == 'focus') {
                        focusedElement = e.target;
                    } else {
                        focusedElement = document.activeElement;
                    }

                    if (focusedElement && focusedElement.closest && rb.root.classList.contains(keyboardFocusClass) && (cell = focusedElement.closest(cellSel)) && that.isCellVisible(cell) !== true) {
                        pageIndex = that.getPageIndexOfCell(cell);
                        if (pageIndex != that._selectedIndex) {
                            that.selectedIndex = pageIndex;
                        }
                    }
                }
                setTimeout(resetScrollLeft);
                resetScrollLeft();
            };
            var unstopTest = function unstopTest() {
                isTestStopped = false;
            };
            var stopTest = function stopTest() {
                if (!isTestStopped) {
                    isTestStopped = true;
                    setTimeout(unstopTest, 99);
                }
            };

            this.scroller.addEventListener('mousedown', stopTest, evtOpts);
            this.scroller.addEventListener('touchstart', stopTest, evtOpts);
            this.scroller.addEventListener('touchend', stopTest, evtOpts);
            this.scroller.addEventListener('click', stopTest, evtOpts);
            this.scroller.addEventListener('focus', scrollIntoView, evtOpts);
            this.viewport.addEventListener('scroll', scrollIntoView);
        };

        ItemScroller.prototype._snapTo = function _snapTo(dir, velocity, length) {
            var pageIndex;
            var fullVel = velocity + Math.abs(dir);

            length = Math.abs(length);

            this.easing = this._dragEasing;

            if (dir && (fullVel > 33 || fullVel > 9 && length > 99 || fullVel > 3 && length > 200)) {

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
        };

        ItemScroller.prototype.getNearest = function getNearest() {
            var prop, curDiff;
            var smallestDif = Number.MAX_VALUE;
            var index = 0;
            var nowIndex = this.selectedIndex;
            var pos = {
                prev: this.getPrev() + this.baseIndex,
                next: this.getNext() + this.baseIndex
            };

            if (pos.next - pos.prev > 1) {
                pos.cur = pos.next - 1;
            }

            for (prop in pos) {
                curDiff = Math.abs(this._pos - this._getPosition(pos[prop]));
                if (curDiff < smallestDif || nowIndex == pos[prop] && curDiff - 0.9 <= smallestDif) {
                    smallestDif = curDiff;
                    index = pos[prop];
                }
            }

            return index - this.baseIndex;
        };

        ItemScroller.prototype.selectNearest = function selectNearest(noAnimate) {
            return this.selectIndex(this.getNearest(), noAnimate);
        };

        ItemScroller.prototype._getPosition = function _getPosition(index) {
            var halfWidth = this.viewportWidth / 2;
            var curData = this.pageData[index];
            var position = curData.l;

            if (this.options.centerMode) {
                position = halfWidth + position * -1 - (curData.r - position) / 2;
            } else {
                position *= -1;
            }

            if (!this.isCarousel && position < this.minScroll) {
                position = this.minScroll;
            }

            return position || 0;
        };

        ItemScroller.prototype.getNext = function getNext(offset) {
            var i, len, cellWidth;
            var curPos = (this._pos + (offset || 0)) * -1 + 1;
            var index = this.pageData.length - 1;

            for (i = 0, len = index + 1; i < len; i++) {
                cellWidth = this._getPosition(i) * -1;
                if (cellWidth > curPos) {
                    index = i;
                    break;
                }
            }

            return index - this.baseIndex;
        };

        ItemScroller.prototype.selectNext = function selectNext(noAnimate) {
            return this.selectIndex(this.getNext(), noAnimate);
        };

        ItemScroller.prototype.getPrev = function getPrev(offset) {
            var cellWidth;
            var curPos = (this._pos + (offset || 0)) * -1 - 1;
            var index = 0;
            var i = this.pageData.length - 1;

            while (i >= 0) {
                cellWidth = this._getPosition(i) * -1;
                if (cellWidth < curPos) {
                    index = i;
                    break;
                }
                i--;
            }

            return index - this.baseIndex;
        };

        ItemScroller.prototype.selectPrev = function selectPrev(noAnimate) {
            return this.selectIndex(this.getPrev(), noAnimate);
        };

        ItemScroller.prototype.getPageIndexOfCell = function getPageIndexOfCell(cellIndex) {
            if (typeof cellIndex != 'number') {
                cellIndex = this.$cells.index(cellIndex);
            }

            var cellData = this.cellData[cellIndex];

            return cellData ? cellData[cellData.isSide ? 'uIndex' : 'pageIndex'] : -1;
        };

        ItemScroller.prototype.selectCell = function selectCell(cellIndex, noAnimate) {
            this.selectIndex(this.getPageIndexOfCell(cellIndex), noAnimate);
        };

        ItemScroller.prototype.isCellVisible = function isCellVisible(cellIndex) {
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
                roundingTolerance = 0.6 * cellIndex + 1;
                viewportLeft -= roundingTolerance;
                viewportRight += roundingTolerance;
                viewportLeftPartial += roundingTolerance;
                viewportRightPartial -= roundingTolerance;
                cellLeft = cellData.isSide ? cellData.ul : cellData.l;
                cellRight = cellData.isSide ? cellData.ur : cellData.r;

                if (viewportLeft <= cellLeft && viewportRight >= cellRight) {
                    inview = true;
                } else if (viewportLeftPartial <= cellLeft && viewportRightPartial >= cellLeft || viewportLeftPartial <= cellRight && viewportRightPartial >= cellRight) {
                    inview = 'partial';
                }
            }

            return inview;
        };

        ItemScroller.prototype._slideProgress = function _slideProgress(tween, progress) {
            this._setPos((this._animEnd - this._animStart) * this.easing(progress) + this._animStart);
        };

        ItemScroller.prototype._slideComplete = function _slideComplete() {
            var curPage = this.pageData[this._selectedIndex + this.baseIndex];
            var activeDone = rb.statePrefix + 'active' + rb.nameSeparator + 'done';

            this.isAnimated = false;
            this.$cells.removeClass(activeDone);

            this.easing = this._easing;

            if (curPage) {
                (curPage.$cellElems || (curPage.$cellElems = $(curPage.cellElems))).addClass(activeDone).addClass(rb.statePrefix + 'activated' + rb.nameSeparator + 'done');
            }

            this.trigger(this._evtName + 'completed');
        };

        ItemScroller.prototype.selectNextIndex = function selectNextIndex() {
            var index = this._selectedIndex + 1 + this.baseIndex;

            if (index < this.pageData.length) {
                index -= this.baseIndex;
                this.selectedIndex = index;
            }
        };

        ItemScroller.prototype.selectPrevIndex = function selectPrevIndex() {
            var index = this._selectedIndex - 1 + this.baseIndex;

            if (index >= 0) {
                index -= this.baseIndex;
                this.selectedIndex = index;
            }
        };

        ItemScroller.prototype.selectIndex = function selectIndex(index, noAnimate) {
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
                    if (this.trigger(this._beforeEvtName, { nextIndex: index }).defaultPrevented) {
                        return this._selectedIndex;
                    }
                    trigger = true;
                    this._selectedIndex = index;
                }

                this._animStart = false;
                this._animEnd = setPos;
                this.scroller.rbItemscrollerPos = this._pos;
                this.$scroller.stop();

                duration = this.duration * (setPos < this._pos ? this._pos - setPos : setPos - this._pos) / this.viewportWidth;
                duration = Math.max(Math.min(duration, this.maxDuration), this.minDuration);

                if (noAnimate) {
                    this.setPos(setPos);
                    this.isAnimated = false;
                } else {
                    this.isAnimated = true;
                    this._animStart = this._pos;
                    this.$scroller.animate({
                        rbItemscrollerPos: setPos
                    }, {
                        easing: 'linear',
                        start: this._pos,
                        progress: this._slideProgress,
                        duration: duration,
                        complete: this._slideComplete
                    });
                }

                this._updateControls(setPos);

                if (trigger) {
                    this.trigger({ prevIndex: curIndex });
                    if (noAnimate) {
                        this._slideComplete();
                    }
                }
            }

            this._selectedIndex = index;

            return this._selectedIndex;
        };

        ItemScroller.prototype.isStartReached = function isStartReached(position) {
            if (position == null) {
                position = this._pos;
            }
            return !this.isCarousel && position >= this.maxScroll;
        };

        ItemScroller.prototype.isEndReached = function isEndReached(position) {
            if (position == null) {
                position = this._pos;
            }

            return !this.isCarousel && position <= this.minScroll;
        };

        ItemScroller.prototype._updateControls = function _updateControls(pos) {
            var isEnd, isStart;

            var curPage = this.pageData[this._selectedIndex + this.baseIndex];

            if (!this.isCarousel || this.isCarouselChanged) {
                isEnd = this.isEndReached(pos);
                isStart = this.isStartReached(pos);

                this.isCarouselChanged = false;

                this.$queryAll('.{htmlName}{e}btn{-}next').prop({ disabled: isEnd }).rbChangeState('disabled', isEnd);

                this.$queryAll('.{htmlName}{e}btn{-}prev').prop({ disabled: isStart }).rbChangeState('disabled', isStart);
            }

            this.element.setAttribute('data-current-index', this._selectedIndex + 1);

            this.$currentIndex.html(this._selectedIndex + 1);

            this.$cells.removeClass(rb.statePrefix + 'active');
            if (curPage) {
                (curPage.$cellElems || (curPage.$cellElems = $(curPage.cellElems))).addClass(rb.statePrefix + 'activated').addClass(rb.statePrefix + 'active');
            }

            this.$paginationBtns.removeClass(rb.statePrefix + 'selected').eq(this._selectedIndex).addClass(rb.statePrefix + 'selected');
        };

        ItemScroller.prototype._dragStart = function _dragStart() {
            this.isAnimated = false;
            $(this.scroller).stop();
        };

        ItemScroller.prototype._dragMove = function _dragMove(draggy) {
            if (draggy.relPos.x) {
                this._setRelPos(draggy.relPos.x * -1, true);
            }
        };

        ItemScroller.prototype._dragEnd = function _dragEnd(draggy) {
            if (!draggy.movedPos.x) {
                this.selectNearest();
                return;
            }
            var dir = draggy.lastPos.x - draggy.velPos.x;

            if (draggy.horizontalVel < 9) {

                dir = 0;
                if (draggy.horizontalVel < 9 && draggy.horizontalVel < 9) {
                    draggy.allowClick();
                }
            }

            this._snapTo(dir, draggy.horizontalVel, draggy.movedPos.x);
        };

        ItemScroller.prototype._setupTouch = function _setupTouch() {
            if (!$.fn.draggy) {
                return;
            }

            $(this.viewport).draggy({
                vertical: false,
                useMouse: this.options.mouseDrag,
                exclude: this.options.dragExclude,
                start: this._dragStart,
                end: this._dragEnd,
                move: this._dragMove
            });
        };

        ItemScroller.prototype._setRelPos = function _setRelPos(relPos, keepInBounds) {
            var minOverflow, maxOverflow, overflow, overflow_max;

            var newPos = this._pos + relPos;

            // reduce relative change, if the new pos is out of min/maxScroll
            if (keepInBounds && !this.isCarousel) {
                minOverflow = Math.abs(Math.min(0, newPos - this.minScroll));
                maxOverflow = Math.abs(Math.max(0, newPos - this.maxScroll));
                overflow = minOverflow > maxOverflow ? minOverflow : maxOverflow;
                overflow_max = this.viewportWidth / 1.5;

                if (overflow) {
                    newPos = this._pos + relPos * (1 - (overflow / overflow_max + 0.05));
                }
            }

            this._pos = newPos;
            this.setPos(newPos);
        };

        ItemScroller.prototype._setOrder = function _setOrder(elem, order) {
            elem.style[orderProp] = order;
        };

        ItemScroller.prototype._changeWrap = function _changeWrap(side, prop) {
            var i, len, curCell, order, unitPos;
            var posPages = this.posPages[side];
            var cells = this.posPages[side].rbCells;

            if (prop == 'ul') {
                this.isWrap = side;
            } else {
                this.isWrap = '';
            }

            order = this.isWrap == 'left' ? this.options.startOrder : this.isWrap == 'right' ? this.options.endOrder : '';

            unitPos = this.options.usePx ? posPages._helperLeft + 'px' : posPages._helperLeft / this.viewportWidth * 100 + '%';

            this.helperElem.style.marginLeft = this.isWrap ? unitPos : '';

            if (this._isPageDirty) {
                this._isPageDirty = false;
                for (i = 0, len = this.$cells.length; i < len; i++) {
                    this.$cells.get(i).style[orderProp] = '';
                }
            }

            for (i = 0, len = cells.length; i < len; i++) {
                curCell = cells[i];
                curCell.isSide = this.isWrap;
                this._setOrder(curCell.elem, order);
            }
        };

        ItemScroller.prototype._setPos = function _setPos(pos) {
            var shouldWrapLeft, shouldWrapRight, unWrapLeft, unWrapRight, unitPos;

            if (this.isCarousel) {
                if (pos >= this.maxWrapLeft || pos <= this.minWrapRight) {
                    if (pos >= this.maxWrapLeft) {
                        pos -= this.carouselWidth;
                    } else if (pos <= this.minWrapRight) {
                        pos += this.carouselWidth;
                    }
                }

                shouldWrapLeft = pos >= this.minWrapLeft && pos <= this.maxWrapLeft;
                shouldWrapRight = pos >= this.minWrapRight && pos <= this.maxWrapRight;
                unWrapLeft = this.isWrap == 'left' && !shouldWrapLeft && this.maxUnwrapLeft <= pos && this.minUnwrapLeft >= pos;
                unWrapRight = this.isWrap == 'right' && !shouldWrapRight && this.maxUnwrapRight <= pos && this.minUnwrapRight >= pos; //

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

            unitPos = this.options.usePx ? pos + 'px' : pos / this.viewportWidth * 100 + '%';

            if (this.usesTransform) {
                this.scroller.style[transformProp] = supports3dTransform ? 'translate3d(' + unitPos + ', 0, 0)' : 'translateX(' + unitPos + ')';
            } else {
                this.scroller.style.left = unitPos;
            }

            this.onslide.fireWith(this);
        };

        ItemScroller.prototype.updateCells = function updateCells() {
            var that = this;
            var cellSelector = ':not(.js' + rb.nameSeparator + this.name + rb.elementSeparator + 'helper)';

            if (this.options.excludeCell) {
                cellSelector += ':not(' + this.options.excludeCell + ')';
            }

            this.$cells = this.$scroller.children(cellSelector);

            if (this.options.excludeHiddenCells) {
                this.$cells = this.$cells.filter(function () {
                    return rb.getStyles(this).display != 'none';
                });
            }

            this.calculateLayout();

            rb.rAFQueue(function () {
                that.$scroller.prepend(that.helperElem);
                that.$cells.addClass(that.name + rb.elementSeparator + 'cell');
            });
        };

        ItemScroller.prototype._getCellWidth = function _getCellWidth(element) {
            return $(element).outerWidth();
        };

        ItemScroller.prototype.calculateLayout = function calculateLayout() {
            if (this.options.switchedOff) {
                return;
            }

            if (this.cellData && !this.scroller.offsetWidth && !this.scroller.offsetHeight) {
                return;
            }

            this.viewportWidth = this.$scroller.width();

            this._calculateCellLayout();

            this._calculatePages();

            this._writeLayout();
        };

        ItemScroller.prototype._calculateCellLayout = function _calculateCellLayout() {
            var that = this;
            var lastWidth = 0;

            this.cellData = this.$cells.map(function () {
                var returnWidth = lastWidth;
                var width = that._getCellWidth(this);

                lastWidth = returnWidth + width + rb.getCSSNumbers(this, ['margin-left', 'margin-right']);

                return { w: width, elem: this, r: lastWidth, l: returnWidth };
            }).get();

            this.cellData.push({ l: lastWidth, w: 0, r: lastWidth, index: 'last', elem: null });

            this.maxWrapRight = (lastWidth - this.viewportWidth) * -1;

            if (this.maxWrapRight > 0) {
                this.maxWrapRight = 0;
            }
        };

        ItemScroller.prototype._writeLayout = function _writeLayout() {
            var wasPos = this._pos;

            if (this.isWrap) {
                this._changeWrap(this.isWrap, this.isCarousel ? 'ul' : 'l');
            }

            this.selectIndex(this._selectedIndex, true);

            if (wasPos == this._pos) {
                this._setPos(wasPos);
                this._updateControls(this._pos);
            }
        };

        ItemScroller.prototype._calculatePages = function _calculatePages() {
            var overScrollPos, halfViewport, roundingTolerance, i, len, absMinScroll, nextPageLeft, nextI, curPage, cellData;

            var scrollStep = this.options.scrollStep;
            var pageLength = this.pageLength;
            var overkillLength = 0;

            this.pageData = this.cellData;

            if (!this.$cells.length) {
                return;
            }

            if (scrollStep == 'auto') {
                scrollStep = this.options.centerMode ? 1 : 'view';
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
                this.minScroll = halfViewport + this.cellData[this.cellData.length - 2].l * -1 - (this.cellData[this.cellData.length - 1].l - this.cellData[this.cellData.length - 2].l || 1) / 2;
                this.maxScroll = halfViewport - (this.cellData[1].l || 1) / 2;
            } else {
                this.minScroll = this.maxWrapRight;
                this.maxScroll = this.minWrapLeft || 0;
            }

            overScrollPos = this.minScroll * -1;

            this.pageData = [];
            nextPageLeft = 0;

            this._isPageDirty = true;

            for (i = 0, len = this.cellData.length - 1; i < len; i++) {
                roundingTolerance = i * 0.5 + 0.5;
                cellData = this.cellData[i];
                if (!curPage || this.cellData[i + 1].l >= nextPageLeft + roundingTolerance) {

                    if (!this.options.centerMode && curPage && overScrollPos - roundingTolerance < curPage.l) {
                        overkillLength++;
                    }

                    curPage = {
                        l: cellData.l,
                        cells: [cellData],
                        cellElems: [cellData.elem],
                        i: curPage ? curPage.i + 1 : 0
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
                if (pageLength != null) {
                    this._adjustSelectedIndex();
                }
                this._createPagination();
                if (pageLength > -1) {
                    this.trigger('pagelengthchanged');
                }
            }
        };

        ItemScroller.prototype._adjustSelectedIndex = function _adjustSelectedIndex() {
            var active = this.$cells.filter('.' + rb.statePrefix + 'active').get(0);

            if (active) {
                this._selectedIndex = this.getPageIndexOfCell(active);
            } else if (this.pageLength < this.selectedIndex) {
                this.selectedIndex = this.pageLength - 1;
            }
        };

        ItemScroller.prototype._addPosCorrect = function _addPosCorrect(pageData, cells, pageCorrect, wrappedIndex) {
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
                cellElems: pageData.cellElems
            };
        };

        ItemScroller.prototype._createCarouselPages = function _createCarouselPages() {
            var i, len, pageData, curWidth, pageCorrect, negativeIndex, lastPos;

            var viewport = this.viewportWidth;
            var wasCarousel = this.isCarousel;

            this.posPages = { left: [], right: [] };
            this.posPages.right.rbCells = [];
            this.posPages.left.rbCells = [];

            this.isCarousel = false;

            if (supportSomeOrder && this.options.carousel && this.pageData.length > 1 && this.cellData[this.cellData.length - 1].l / 1.99 >= this.viewportWidth) {
                this.isCarousel = this.cellData[this.cellData.length - 1].l / 2.4 > this.viewportWidth;

                if (!this.isCarousel && this.cellData[0].w > this.viewportWidth - 1 && this.cellData[1].w > this.viewportWidth - 1) {
                    this.isCarousel = true;
                }
            }

            this.isCarouselChanged = wasCarousel != this.isCarousel;

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

            lastPos = this.posPages.right[this.posPages.right.length - 1];

            this.posPages.right._helperLeft = lastPos.or;

            this.maxUnwrapRight = lastPos.or * -1 - viewport;

            lastPos = this.posPages.left[this.posPages.left.length - 1];

            this.posPages.left._helperLeft = lastPos.l;

            this.minUnwrapLeft = lastPos.ol * -1 + viewport;
            this.maxUnwrapLeft = this.posPages.left[0].or * -1 - viewport;

            this.pageData.unshift.apply(this.pageData, this.posPages.left.reverse());
            this.pageData.push.apply(this.pageData, this.posPages.right);
            this.baseIndex = this.posPages.left.length;
        };

        ItemScroller.prototype._createPagination = function _createPagination() {
            var paginationItems, i;
            var baseLength = this.pageLength;
            var paginationItemTpl = this.interpolateName(this.options.paginationItemTpl);

            this.element.setAttribute('data-page-length', baseLength);
            this.$pageLength.html(baseLength);

            if (this.$pagination.length && this.$paginationBtns.length != baseLength) {
                paginationItems = [];

                for (i = 0; i < baseLength; i++) {
                    paginationItems.push(paginationItemTpl.replace(regIndex, '' + (i + 1)));
                }
                this.$pagination.html(paginationItems.join(''));
                this.$paginationBtns = this.$pagination.find('.' + this.name + rb.elementSeparator + 'pagination' + rb.nameSeparator + 'btn');
                this.$paginationBtns.eq(this._selectedIndex).addClass(rb.statePrefix + 'selected');
            }
        };

        _createClass(ItemScroller, [{
            key: 'selectedIndex',
            get: function get() {
                return this._selectedIndex;
            },
            set: function set(index) {
                this.selectIndex(index);
            }
        }], [{
            key: 'events',
            get: function get() {
                return {
                    'click:closest(.{name}{e}btn{-}next)': function clickClosestNameEBtnNext() {
                        if (this.options.switchedOff) {
                            return;
                        }
                        if (this.isCarousel) {
                            this.selectNext();
                        } else {
                            this.selectNextIndex();
                        }
                    },
                    'click:closest(.{name}{e}btn{-}prev)': function clickClosestNameEBtnPrev() {
                        if (this.options.switchedOff) {
                            return;
                        }
                        if (this.isCarousel) {
                            this.selectPrev();
                        } else {
                            this.selectPrevIndex();
                        }
                    },
                    'click:closest(.{name}{e}pagination{-}btn)': function clickClosestNameEPaginationBtn(e) {
                        if (this.options.switchedOff) {
                            return;
                        }
                        var index = this.$paginationBtns.index(e.delegatedTarget || e.currentTarget);
                        this.selectedIndex = index;
                    },

                    'rb_resize:width()': 'calculateLayout'
                };
            }
        }]);

        return ItemScroller;
    }(rb.Component);

    rb.live.register('itemscroller', ItemScroller);

    exports.default = ItemScroller;
});
