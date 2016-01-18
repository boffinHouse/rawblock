(function (factory) {
    if (typeof module === 'object' && module.exports) {
        require('../rb_panel/rb_panel');
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';

    var rb = window.rb;
    var $ = rb.$;
    var life = rb.life;
    var componentExpando = life.componentExpando;
    var components = rb.components;

    var cleanupCSS = function () {
        var css = {display: ''};

        if (!this.style.height.startsWith('0')) {
            css.height = '';
            css.overflow = '';
        }

        $(this).css(css);
    };

    rb.Component.extend('panelgroup',
        /** @lends rb.components.panelgroup.prototype */
        {
            /**
             * @static
             * @mixes rb.Component.defaults
             * @property {Object} defaults
             * @property {Boolean}  defaults.toggle=true Whether a panel button toggles the state of a panel (default: is open only).
             * @property {Boolean}  defaults.multiple=false Whether multiple panels are allowed to be open at the same time. If `multiple` is `true` `toggle` is also automatically set to `true`.
             * @property {Number}  defaults.selectedIndex=-1 The initially opened index. If no panel with the class `is-open` was found. If no panel should be opened by default use -1.
             * @property {Boolean}  defaults.closeOnFocusout=false Closes all panels of a group on focusout.
             * @property {String}  defaults.animation='' Possible animations: 'adaptHeight', 'slide'. These should be combined with CSS transitions or animations.
             * @property {String}  defaults.easing='' Easing function for the animation.
             * @property {Number}  defaults.duration=400 Duration of the animation.
             * @property {Boolean|Number}  defaults.adjustScroll=false The adjustScroll option can be combined with the 'slide' animation in a accordion component. So that closing a large panel doesn't move the opening panel out of view. Possible values: `true`, `false`, any Number but not 0.
             * @property {Boolean}  defaults.setFocus=true Whether component should try to focus a `js-autofocus` element inside of an opening panel.
             * @property {Boolean}  defaults.preventDefault=false Whether default click action on "{name}-btn" should be prevented.
             * @property {String}  defaults.itemWrapper='' Set itemWrapper option of the panel instance.
             * @property {Boolean}  defaults.switchedOff=false Turns off panelgroup.
             * @property {Boolean} defaults.resetSwitchedOff=true Resets panels to initial state on reset switch.
             * @property {String} defaults.panelName='{name}-panel' Name of the constructed panels.
             * @property {String}  defaults.panelSel='find(.{name}-panel)' Reference to find all panels associated with this component group. For a nested accordion/tab use "children(.{name}-panel)".
             * @property {String}  defaults.btnSel='find(.{name}-btn)' Reference to find all panel buttons associated with this component group. For a nested accordion/tab use "children(.{name}-btn)".
             * @property {String}  defaults.groupBtnSel='find(.{name}-ctrl-btn)' Reference to find all panelgroup buttons associated with this component group. For a nested accordion/tab use "children(.{name}-ctrl-btn)".
             * @property {String}  defaults.panelWrapperSel='find(.{name}-panel-wrapper):0' Reference to find the panelwrapper(s) associated with this component group. If no panelwrapper is found the component element is used. For a nested accordion/tab use "children(.{name}-panel-wrapper)".
             * @property {String}  defaults.btnWrapperSel='find(.{name}-panel-btn-wrapper):0'  Reference to find the button wrapper(s) associated with this component group. If no button wrapper is found the component element is used. For a nested accordion/tab use "children(.{name}-panel-btn-wrapper)".
             */
            defaults: {
                multiple: false,
                toggle: true,
                animation: '', // 'adaptHeight' || 'slide'
                easing: '',
                duration: 400,
                closeOnFocusout: false,
                selectedIndex: -1,
                adjustScroll: false, //true || false
                setFocus: true,
                switchedOff: false,
                resetSwitchedOff: true,
                panelName: '{name}-panel',
                panelSel: 'find(.{name}-panel)',
                btnSel: 'find(.{name}-btn)',
                groupBtnSel: 'find(.{name}-ctrl-btn)',
                panelWrapperSel: 'find(.{name}-panel-wrapper):0',
                btnWrapperSel: 'find(.{name}-panel-btn-wrapper):0',
                itemWrapper: '',
            },
            statics: {},
            /**
             * @constructs
             * @classdesc Class component to create a tab-like or an accordion-like component.
             * @name rb.components.panelgroup
             * @extends rb.Component
             *
             * @param element {Element}
             *
             * @fires panelgroup#changed Fires after the `selectedIndexes`/`selectedItems` changes. Note the panel#change and panel#changed events are also fired on the panel elements.
             *
             * @prop {Number[]} selectedIndexes The index(es) of the open panel(s)
             * @prop {Element[]} selectedItems The dom element(s) of the open panel(s)
             *
             * @example
             * <div class="rb-tabs js-click" data-module="panelgroup" data-toggle="false">
             *      <button type="button" class="panelgroup-ctrl-btn" data-type="prev">&lt;</button>
             *      <button type="button" class="panelgroup-ctrl-btn" data-type="next">&gt;</button>
             *
             *      <button type="button" class="panelgroup-btn">1</button>
             *      <div class="panelgroup-panel">
             *          {{panelContent}}
             *      </div>
             *
             *      <button type="button" class="panelgroup-btn">2</button>
             *      <div class="panelgroup-panel">
             *          {{panelContent}}
             *      </div>
             * </div>
             * @example
             * rb.$('.rb-tabs').on('panelgroupchanged', function(){
			 *      console.log(rb.$(this).rbComponent().selectedIndexes);
			 * });
             *
             * rb.$('.rb-tabs').rbComponent().next();
             */
            init: function (element) {
                this._super(element);

                if (this.options.multiple && !this.options.toggle) {
                    this.options.toggle = true;
                }

                this.$element = $(element);

                this.selectedIndexes = [];
                this.selectedItems = [];

                rb.rAFs(this, 'setSelectedState', 'setSwitchedOffClass');

                this._onOutSideInteraction = this._onOutSideInteraction.bind(this);

                this.setOption('easing', this.options.easing);

                this.panelName = this.interpolateName(this.options.panelName);

                if (!this.options.switchedOff) {
                    this.setOption('switchedOff', false);
                } else {
                    this.setSwitchedOffClass();
                }
            },
            setSwitchedOffClass: function(){
                this.element.classList[this.options.switchedOff ? 'add' : 'remove'](rb.statePrefix + 'switched-off');
            },
            _handleAnimation: function(animationData){
                if(animationData.animation == 'slide' && animationData.panel.isOpen){
                    this.adjustScroll(animationData.panel, animationData.options);
                } else if(animationData.animation == 'adaptHeight' && animationData.panel.isOpen){
                    this.animateWrapper(animationData.panel.element);
                }
            },
            animateWrapper: function (openedPanel) {
                var end;

                var that = this;
                var panels = this.$panels.get();
                var curIndex = -1;
                var panelWrapper = this.$panelWrapper.get(0);
                var nextIndex = panels.indexOf(openedPanel);
                var closingPanels = [];

                var start = panelWrapper.offsetHeight;

                this.$panelWrapper.stop();

                panelWrapper.style.height = 'auto';

                this.selectedItems.forEach(function (panel) {
                    panel.style.display = 'none';
                    curIndex = panels.indexOf(panel);
                    closingPanels.push(panel);
                });

                openedPanel.style.display = 'block';
                openedPanel.style.position = 'relative';

                end = panelWrapper.offsetHeight;

                this.selectedItems.forEach(function (panel) {
                    panel.style.display = '';
                });
                openedPanel.style.display = '';
                openedPanel.style.position = '';

                $(closingPanels).addClass(rb.statePrefix + 'closing');

                this.$panelWrapper
                    .attr({'data-direction': nextIndex > curIndex ? 'up' : 'down'})
                    .css({
                        overflow: 'hidden',
                        height: start + 'px'
                    })
                    .animate({height: end}, {
                        duration: this.options.duration,
                        easing: this.options.easing,
                        always: function () {
                            that.$panels.removeClass(rb.statePrefix + 'closing');
                            that.$panelWrapper
                                .removeClass(rb.statePrefix + 'fx')
                                .attr({'data-direction': ''})
                            ;
                            cleanupCSS.call(this);
                        }
                    })
                    .addClass(rb.statePrefix + 'fx')
                ;

            },
            adjustScroll: function (openingPanelComponent, options, force) {
                var opts = this.options;
                if (!force && (!opts.adjustScroll || opts.multiple)) {
                    return;
                }

                var compareElem = opts.adjustScroll && document.activeElement || false;
                var scrollingElement = rb.getScrollingElement();
                var scrollTop = scrollingElement.scrollTop;
                var $panels = this.$panels;
                var index = this.$panels.index(openingPanelComponent.element);
                var adjustHeight = this.selectedItems.reduce(function (height, item) {
                    var position;
                    if ($panels.index(item) < index && (!compareElem || ((position = compareElem.compareDocumentPosition(item)) && position != 4 && position != 20))) {
                        height += item.offsetHeight;
                    }
                    return height;
                }, 0);

                if (adjustHeight > 0) {

                    if (compareElem && typeof opts.adjustScroll == 'number') {
                        adjustHeight -= compareElem.getBoundingClientRect().top - opts.adjustScroll;
                    }

                    if (adjustHeight > 0) {
                        $(scrollingElement)
                            .animate(
                                {
                                    scrollTop: Math.max(scrollTop - adjustHeight, 0)
                                },
                                options
                            );
                    }
                }
            },
            setSelectedState: function () {
                this.element.classList[this.selectedIndexes.length ? 'add' : 'remove'](rb.statePrefix + 'selected-within');
            },
            _updatePanelInformation: function () {
                var that = this;
                this.selectedIndexes.length = 0;
                this.selectedItems.length = 0;

                this.$panels.each(function (i) {
                    if (this[componentExpando].isOpen) {
                        that.selectedIndexes.push(i);
                        that.selectedItems.push(this);
                    }
                });

                if (this.options.closeOnFocusout) {
                    this._addRemoveFocusOut();
                }
                this.setSelectedState();
            },
            _addRemoveFocusOut: function () {
                var shouldInstall = this.options.closeOnFocusout && this.selectedItems.length;

                if (shouldInstall && !this._hasFocusOutListener) {
                    document.addEventListener('focusin', this._onOutSideInteraction, true);
                    document.body.addEventListener('mousedown', this._onOutSideInteraction, true);
                } else if (!shouldInstall && this._hasFocusOutListener) {
                    document.removeEventListener('focusin', this._onOutSideInteraction, true);
                    document.body.removeEventListener('mousedown', this._onOutSideInteraction, true);
                }
            },
            _onOutSideInteraction: function (e) {
                if (!rb.contains(this.element, e.target)) {
                    this.closeAll();
                }
            },
            _getElements: function () {
                var panels;
                var that = this;
                var options = this.options;
                var panelName = this.panelName;

                var buttonWrapper = this.getElementsFromString(options.btnWrapperSel)[0];
                var itemWrapper = this.interpolateName(this.options.itemWrapper || '');
                this.$panelWrapper = $(this.getElementsFromString(options.panelWrapperSel));

                components.panel.prototype.name = panelName;

                this.$panels = $(this.getElementsFromString(options.panelSel, this.$panelWrapper.get(0))).each(function (index) {
                    var panel = life.create(this, rb.components.panel);
                    panel.group = that.element;
                    panel.groupComponent = that;
                    panel.name = panelName;
                    panel.setOption('resetSwitchedOff', options.resetSwitchedOff);
                    panel.setOption('setFocus', options.setFocus);
                    panel.setOption('itemWrapper', itemWrapper);

                });

                components.panel.prototype.name = 'panel';

                panels = this.$panels;

                this.$buttons = $(this.getElementsFromString(options.btnSel, buttonWrapper)).each(function (index) {
                    var btn = life.create(this, components.panelbutton);
                    btn.setTarget(panels.get(index));
                    btn.setOption('type', (options.toggle) ? 'toggle' : 'open');
                    btn.setOption('preventDefault', options.preventDefault);
                });

                this.$groupButtons = $(this.getElementsFromString(options.groupBtnSel)).each(function (index) {
                    var btn = life.create(this, components.panelgroupbutton);
                    btn.setTarget(that.element);
                    btn.setOption('preventDefault', options.preventDefault);
                });
            },
            /**
             * Closes all panels of a group. If a panel is passed as the except argument, this panel won't be closed.
             * @param {Element|ComponentInstance|Number} [except]
             */
            closeAll: function (except) {
                this.selectedItems.forEach(function (panel, i) {
                    var component = life.getComponent(panel);
                    if (component && component != except && panel != except && i !== except) {
                        component.close();
                    }
                });
            },
            /**
             * Opens all panels of a group. If a panel is passed as the except argument, this panel won't be opened.
             * @param {Element|ComponentInstance|Number} [except]
             */
            openAll: function(except){
                this.$panels.get().forEach(function(panel, i){
                    var component = life.getComponent(panel);
                    if (component && component != except && panel != except && i !== except) {
                        component.open();
                    }
                });
            },
            /**
             * Toggles all panel isOpen state
             */
            toggleAll: function(){
                if(this.selectedItems.length){
                    this.closeAll();
                } else {
                    this.openAll();
                }
            },
            _triggerOnce: function () {
                var that;

                if (!this._isTriggering) {
                    that = this;
                    this._isTriggering = true;
                    setTimeout(function () {
                        that._isTriggering = false;
                        that._trigger();
                    });
                }
            },
            panelChangeCB: function (panelComponent, action) {
                var options = this.options;

                switch (action) {
                    case 'beforeopen':
                        if (!options.multiple && this.selectedItems.length) {
                            this.closeAll(panelComponent);
                        }
                        break;
                    case 'afteropen':
                    case 'afterclose':
                        this._updatePanelInformation();
                        this._triggerOnce();
                        break;
                }
            },
            /**
             * Selects next panel.
             * @param options {Object} options Options are passed to the open method of the panel instance.
             */
            next: function (options) {
                var selectedIndex = (this.selectedIndexes[0] || 0) + 1;
                if (selectedIndex >= this.$panels.get().length) {
                    selectedIndex = 0;
                }
                this.selectIndex(selectedIndex, options);
            },
            /**
             * Selects previous panel.
             * @param options {Object} options Options are passed to the open method of the panel instance.
             */
            prev: function (options) {
                var selectedIndex = (this.selectedIndexes[0] || 0) - 1;
                if (selectedIndex < 0) {
                    selectedIndex = this.$panels.get().length - 1;
                }
                this.selectIndex(selectedIndex, options);
            },
            getComponentByIndexOrDOM: function (index) {
                var panel;
                if (index == null) {
                    index = 0;
                }

                panel = typeof index == 'number' ?
                    this.$panels.get(index) :
                    index
                ;

                if (!panel || !panel[componentExpando]) {
                    return false;
                }
                return panel[componentExpando];
            },

            /**
             * Selects/opens a panel.
             * @param index {Number|Element}
             * @param options {Object} Options are passed to the open method of the panel instance.
             * @returns {Boolean}
             */
            selectIndex: function (index, options) {
                var component = this.getComponentByIndexOrDOM(index);
                return component && component.open(options);
            },
            /**
             * Closes a panel.
             * @param index {Number|Element}
             * @param options {Object} Options are passed to the close method of the panel instance.
             * @returns {Boolean}
             */
            deselectIndex: function (index, options) {
                var component = this.getComponentByIndexOrDOM(index);
                return component && component.close(options);
            },
            setChildOption: function ($childs, name, value) {
                $childs.each(function () {
                    if (this[componentExpando]) {
                        this[componentExpando].setOption(name, value);
                    }
                });
            },
            _switchOff: function () {
                if (this.$panels && this.$buttons) {
                    this.setChildOption(this.$groupButtons, 'switchedOff', true);
                    this.setChildOption(this.$buttons, 'switchedOff', true);
                    this.setChildOption(this.$panels, 'switchedOff', true);
                }
                this.setSwitchedOffClass();
            },
            _switchOn: function () {
                if (!this.$panelWrapper || !this.$panels.length) {
                    this._getElements();
                } else {
                    this.setChildOption(this.$panels, 'switchedOff', false);
                    this.setChildOption(this.$groupButtons, 'switchedOff', false);
                    this.setChildOption(this.$buttons, 'switchedOff', false);
                }

                this._updatePanelInformation();
                this.setSwitchedOffClass();

                if (!this.selectedIndexes.length) {
                    this.selectIndex(this.options.selectedIndex, {animationPrevented: true, setFocus: false});
                }
            },
            setOption: function (name, value) {
                var that;
                if (name == 'multiple' && value && !this.options.toggle) {
                    this.setOption('toggle', true);
                } else if (name == 'toggle' && value != this.options.toggle) {
                    this.setChildOption(this.$buttons, 'type', value ? 'toggle' : 'open');
                } else if (name == 'easing' && value && typeof value == 'string') {
                    rb.addEasing(value);
                } else if (name == 'setFocus' || name == 'resetSwitchedOff') {
                    this.setChildOption(this.$panels, name, value);
                } else if (name == 'closeOnFocusout') {
                    this._addRemoveFocusOut();
                } else if (name == 'switchedOff') {
                    if (value) {
                        this._switchOff();
                    } else {
                        this._switchOn();
                    }
                } else if (name == 'preventDefault') {
                    this.setChildOption(this.$groupButtons, name, value);
                    this.setChildOption(this.$buttons, name, value);
                } else if(name == 'itemWrapper'){
                    value = this.interpolateName(value);
                    this.setChildOption(this.$panels, name, value);
                }

                this._super(name, value);

                if ((name == 'toggle' || name == 'multiple') && this.options.multiple && !this.options.toggle) {
                    that = this;
                    setTimeout(function(){
                        if (that.options.multiple && !that.options.toggle) {
                            that.setOption('toggle', true);
                        }
                    });
                }
            },
        }
    );


    components.button.extend('panelgroupbutton', {
        defaults: {}
    });

    /**
     * @class
     * @classdesc Class component to create a tab component. This component simply just changes some default options of the [panelgroup component]{@link rb.components.panelgroup}.
     * @name rb.components.tabs
     * @extends rb.components.panelgroup
     *
     * @example
     * <div class="rb-tabs js-click" data-module="tabs">
     *      <button type="button" class="tabs-btn" aria-expanded="true">1</button>
     *      <button type="button" class="tabs-btn">2</button>
     *
     *      <button type="button" class="tabs-ctrl-btn" data-type="prev">&lt;</button>
     *      <button type="button" class="tabs-ctrl-btn" data-type="next">&gt;</button>
     *
     *      <div class="tabs-panel is-open">
     *          {{panelContent}}
     *      </div>
     *      <div class="tabs-panel">
     *          {{panelContent}}
     *      </div>
     * </div>
     * @example
     * rb.$('.rb-tabs').on('tabschanged', function(){
	 *      console.log(rb.$(this).rbComponent().selectedIndexes);
	 * });
     *
     * rb.$('.rb-tabs').rbComponent().next();
     */
    components.panelgroup.extend('tabs',
        /** @lends rb.components.tabs.prototype */
        {
            /**
             * @static
             * @mixes rb.components.panelgroup.defaults
             * @property {Object} defaults Changed options compared to the panelgroup component. Go to {@link rb.components.panelgroup#defaults} for detailed option descriptions.
             * @property {Boolean}  defaults.toggle=false
             * @property {Number}  defaults.selectedIndex=0
             * @property {String}  defaults.animation='adaptHeight'
             */
            defaults: {
                selectedIndex: 0,
                toggle: false,
                animation: 'adaptHeight',
            }
        }
    );

    /**
     * @class
     * @classdesc Class component to create a accordion component. This component simply just changes some default options of the [panelgroup component]{@link rb.components.panelgroup}.
     * @name rb.components.accordion
     * @extends rb.components.panelgroup
     *
     *
     * @example
     * <div class="rb-accordion js-click" data-module="accordion">
     *      <button type="button" class="accordion-btn" aria-expanded="true">1</button>
     *      <div class="accordion-panel is-open">
     *          {{panelContent}}
     *      </div>
     *
     *      <button type="button" class="accordion-btn">2</button>
     *      <div class="accordion-panel">
     *          {{panelContent}}
     *      </div>
     * </div>
     * @example
     * rb.$('.rb-tabs').on('accordionchanged', function(){
	 *      console.log(rb.$(this).rbComponent().selectedIndexes);
	 * });
     */
    components.panelgroup.extend('accordion',
        /** @lends rb.components.accordion.prototype */
        {
            /**
             * @static
             * @mixes rb.components.panelgroup.defaults
             * @prop {Object} defaults Changed options compared to the panelgroup component. Go to {@link rb.components.panelgroup#defaults} for detailed option descriptions.
             * @property {Boolean}  defaults.toggle=false
             * @property {Number}  defaults.selectedIndex=0
             * @property {String}  defaults.animation='slide'
             * @property {String}  defaults.adjustScroll=10
             */
            defaults: {
                selectedIndex: 0,
                toggle: false,
                animation: 'slide',
                adjustScroll: 10,
                itemWrapper: '.{name}-item',
            }
        }
    );

    return components.panelgroup;
}));
