import './panelbutton';
import './panel';
import '../utils/rb_contains';

const rb = window.rb;
const $ = rb.$;
const live = rb.live;
const componentExpando = live.componentExpando;
const components = rb.components;

const cleanupCSS = function () {
    const css = {display: ''};

    if (!this.style.height.startsWith('0')) {
        css.height = '';
        css.overflow = '';
    }

    $(this).css(css);
};

/**
 * Class component to create a tab-like or an accordion-like component. Associates panelbuttons and panels and manages the `isOpen` state of the panels.
 *
 * @alias rb.components.panelgroup
 * @extends rb.Component
 *
 * @param element {Element}
 *
 * @fires componentName#changed Fires after the `selectedIndexes`/`selectedItems` changes. Note the panel#change and panel#changed events are also fired on the panel elements.
 *
 * @prop {Number[]} selectedIndexes The index(es) of the open panel(s)
 * @prop {Element[]} selectedItems The dom element(s) of the open panel(s)
 *
 * @example
 * <div class="rb-tabs js-rb-click" data-module="panelgroup" data-panelgroup-toggle="false">
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
class PanelGroup extends rb.Component {
    /**
     * @static
     * @mixes rb.Component.defaults
     * @property {Object} defaults
     * @property {Boolean}  toggle=true Whether a panel button toggles the state of a panel.
     * @property {Boolean}  multiple=false Whether multiple panels are allowed to be open at the same time. If `multiple` is `true` `toggle` is also automatically set to `true`.
     * @property {Number}  selectedIndex=-1 The initially opened index. If no panel with the class `is-open` was found. If no panel should be opened by default use -1. (For performance the `is-open` class should be favored instead of changing this value).
     * @property {Boolean}  closeOnFocusout=false Closes all panels of a group on focusout.
     * @property {String}  animation='' Possible animations: `adaptHeight` or `slide`. These should be combined with CSS transitions or animations.
     * @property {String}  easing='' Easing function for the animation.
     * @property {Number}  duration=400 Duration of the animation.
     * @property {Boolean|Number}  adjustScroll=false Sets the adjustScroll option on the panel components.
     * @property {Boolean|Number}  scrollIntoView=false Sets the scrollIntoView option on the panel components.
     * @property {Boolean|String}  setDisplay=false Sets the setDisplay option on the panel components.
     * @property {Boolean}  setFocus=true Whether component should try to focus a `js-rb-autofocus` element inside of an opening panel.
     * @property {Boolean}  preventDefault=false Whether default click action on "{name}-btn" should be prevented.
     * @property {String}  itemWrapper='' Set itemWrapper option of the panel instance.
     * @property {Boolean}  switchedOff=false Turns off panelgroup.
     * @property {Boolean} resetSwitchedOff=true Resets panels to initial state on reset switch.
     * @property {String} panelName='{name}{e}panel' Name of the constructed panels.
     * @property {Boolean}  closeOnEsc=false Panel closes on ESC keydown.
     * @property {String}  panelSel='find(.{name}{e}panel)' Reference to find all panels associated with this component group. For a nested accordion/tab use "children(.{name}-panel)".
     * @property {String}  btnSel='find(.{name}{e}btn)' Reference to find all panel buttons associated with this component group. For a nested accordion/tab use "children(.{name}-btn)".
     * @property {String}  groupBtnSel='find(.{name}{e}ctrl{-}btn)' Reference to find all panelgroup buttons associated with this component group. For a nested accordion/tab use "children(.{name}-ctrl-btn)".
     * @property {String}  panelWrapperSel='find(.{name}{e}panel{-}wrapper):0' Reference to find the panelwrapper(s) associated with this component group. If no panelwrapper is found the component element is used. For a nested accordion/tab use "children(.{name}-panel-wrapper)".
     * @property {String}  btnWrapperSel='find(.{name}{e}btn{-}wrapper):0'  Reference to find the button wrapper(s) associated with this component group. If no button wrapper is found the component element is used. For a nested accordion/tab use "children(.{name}-panel-btn-wrapper)".
     */
    static get defaults(){
        return {
            multiple: false,
            toggle: true,
            animation: '', // 'adaptHeight' || 'slide'
            easing: '',
            duration: 400,
            closeOnFocusout: false,
            selectedIndex: -1,
            adjustScroll: false,
            scrollIntoView: false,
            setFocus: true,
            switchedOff: false,
            resetSwitchedOff: true,
            panelName: '{name}{e}panel',
            panelSel: 'find(.{name}{e}panel)',
            btnSel: 'find(.{name}{e}btn)',
            groupBtnSel: 'find(.{name}{e}ctrl{-}btn)',
            panelWrapperSel: 'find(.{name}{e}panel{-}wrapper):0',
            btnWrapperSel: 'find(.{name}{e}btn{-}wrapper):0',
            itemWrapper: '',
            setDisplay: false,
        };
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        if (this.options.multiple && !this.options.toggle) {
            this.options.toggle = true;
        }

        this.$element = $(element);

        this.selectedIndexes = [];
        this.selectedItems = [];
        this.closingItems = [];
        this.openingItems = [];

        rb.rAFs(this, 'setSelectedState', 'setSwitchedOffClass');

        this._onOutSideInteraction = this._onOutSideInteraction.bind(this);

        this.setOption('easing', this.options.easing);

        if (!this.options.switchedOff) {
            this.setOption('switchedOff', false);
        } else {
            this.setSwitchedOffClass();
        }
    }

    setSwitchedOffClass(){
        this.element.classList[this.options.switchedOff ? 'add' : 'remove'](rb.statePrefix + 'switched' + rb.nameSeparator + 'off');
    }

    _handleAnimation(animationData){
        if(animationData.animation == 'adaptHeight'){
            if(animationData.panel.isOpen){
                this.animateWrapper(animationData.panel.element);
            } else if(!this._closedByOpen){
                this.animateWrapper();
            }
        }
    }

    animateWrapper(openedPanel) {
        let end;

        const that = this;
        const panels = this.$panels.get();
        const panelWrapper = this.$panelWrapper.get(0);
        const nextIndex = openedPanel ? panels.indexOf(openedPanel) : 0;
        const closingPanels = [];

        let curIndex = -1;

        const start = panelWrapper.offsetHeight;

        this.$panelWrapper.stop();

        panelWrapper.style.height = 'auto';

        this.closingItems.forEach(function (panel) {
            panel.style.display = 'none';
            curIndex = panels.indexOf(panel);
            closingPanels.push(panel);
        });

        if(openedPanel){
            openedPanel.style.display = 'block';
            openedPanel.style.position = 'relative';
        }

        end = panelWrapper.offsetHeight;

        this.closingItems.forEach(function (panel) {
            panel.style.display = '';
        });

        if(openedPanel){
            openedPanel.style.display = '';
            openedPanel.style.position = '';
        }

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
    }

    setSelectedState() {
        this.element.classList.toggle(rb.statePrefix + 'selected' + rb.nameSeparator + 'within', !!this.selectedIndexes.length);
    }

    _updatePanelInformation() {
        const that = this;
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
    }

    _addRemoveFocusOut() {
        const shouldInstall = this.options.closeOnFocusout && this.selectedItems.length;
        const touchEvts = {passive: true, capture: true};

        document.removeEventListener('focus', this._onOutSideInteraction, true);
        document.removeEventListener('mousedown', this._onOutSideInteraction, touchEvts);
        document.removeEventListener('touchstart', this._onOutSideInteraction, touchEvts);

        if (shouldInstall) {
            document.addEventListener('focus', this._onOutSideInteraction, true);
            document.addEventListener('mousedown', this._onOutSideInteraction, touchEvts);
            document.addEventListener('touchstart', this._onOutSideInteraction, touchEvts);
        }
    }

    _onOutSideInteraction(e) {
        var target = e.type == 'touchstart' ?
                (e.changedTouches || e.touches || [e])[0].target :
                e.target
            ;

        if (target && (e.type != 'focus' || target.tabIndex != -1) && !rb.contains(this.element, target) && document.body.contains(target)) {
            this.closeAll();
        }
    }

    _getElements() {
        let panels;
        const that = this;
        const options = this.options;

        const buttonWrapper = this.getElementsFromString(options.btnWrapperSel)[0];
        const itemWrapper = this.interpolateName(this.options.itemWrapper || '');

        const panelName = this.interpolateName(this.options.panelName);
        const jsPanelName = this.interpolateName(this.options.panelName, true);

        this.$panelWrapper = $(this.getElementsFromString(options.panelWrapperSel));

        this.$panels = $(this.getElementsFromString(options.panelSel, this.$panelWrapper.get(0))).each(function () {
            const panel = live.create(this, rb.components.panel, {
                jsName: jsPanelName,
                name: panelName,
                resetSwitchedOff: options.resetSwitchedOff,
                setFocus: options.setFocus,
                itemWrapper: itemWrapper,
                closeOnEsc: options.closeOnEsc,
                adjustScroll: options.adjustScroll,
                scrollIntoView: options.scrollIntoView,
                setDisplay: options.setDisplay,
                autofocusSel: options.autofocusSel,
            });

            panel.group = that.element;
            panel.groupComponent = that;
        });

        panels = this.$panels;

        this.$buttons = $(this.getElementsFromString(options.btnSel, buttonWrapper)).each(function (index) {
            const btn = live.create(this, components.panelbutton, {
                type: (options.toggle) ? 'toggle' : 'open',
                preventDefault: options.preventDefault,
            });
            const panel = panels.get(index);

            if(panel){
                btn._setTarget(panels.get(index));
            }
        });

        this.$groupButtons = $(this.getElementsFromString(options.groupBtnSel)).each(function () {
            live.create(this, components.panelgroupbutton, {
                preventDefault: options.preventDefault,
                target: that.element,
            });
        });
    }
    /**
     * Closes all panels of a group. If a panel is passed as the except argument, this panel won't be closed.
     * @param {Element|ComponentInstance|Number} [except]
     */
    closeAll(except) {
        if(this.selectedItems.length){
            this.$panels.get().forEach(function (panel, i) {
                const component = live.getComponent(panel);
                if (component && component != except && panel != except && i !== except) {
                    component.close();
                }
            });
        }
    }

    /**
     * Opens all panels of a group. If a panel is passed as the except argument, this panel won't be opened.
     * @param {Element|ComponentInstance|Number} [except]
     */
    openAll(except){
        this.$panels.get().forEach(function(panel, i){
            const component = live.getComponent(panel);
            if (component && component != except && panel != except && i !== except) {
                component.open();
            }
        });
    }

    /**
     * Toggles all panel isOpen state
     */
    toggleAll(){
        if(this.selectedItems.length){
            this.closeAll();
        } else {
            this.openAll();
        }
    }

    _triggerOnce() {

        if (!this._isTriggering) {
            let that = this;
            this._isTriggering = true;
            setTimeout(function () {
                that._isTriggering = false;
                that.trigger();
            });
        }
    }

    panelChangeCB(panelComponent, action) {
        const options = this.options;

        if(action.startsWith('before')){

            if (action == 'beforeopen' && !options.multiple && this.selectedItems.length) {
                this._closedByOpen = true;
                this.closeAll(panelComponent);
                this._closedByOpen = false;
            }

            this[action == 'beforeopen' ? 'openingItems' : 'closingItems'].push(panelComponent.element);

            this._updatePanelInformation();
        } else if(action.startsWith('after')){

            if(this.openingItems.length){
                this.openingItems.length = 0;
            }
            if(this.closingItems.length){
                this.closingItems.length = 0;
            }

            this._triggerOnce();
        }

    }

    /**
     * Selects next panel.
     * @param options {Object} options Options are passed to the open method of the panel instance.
     */
    next(options) {
        let selectedIndex = this.selectedIndexes[0];

        selectedIndex = selectedIndex == null ? 0 : selectedIndex + 1;

        if (selectedIndex >= this.$panels.get().length) {
            selectedIndex = 0;
        }

        this.selectIndex(selectedIndex, options);
    }

    /**
     * Selects previous panel.
     * @param options {Object} options Options are passed to the open method of the panel instance.
     */
    prev(options) {
        let selectedIndex = this.selectedIndexes[0];

        selectedIndex = selectedIndex == null ? 0 : selectedIndex - 1;

        if (selectedIndex < 0) {
            selectedIndex = this.$panels.get().length - 1;
        }

        this.selectIndex(selectedIndex, options);
    }

    getComponentByIndexOrDOM(index) {

        if (index == null) {
            index = 0;
        }

        let panel = typeof index == 'number' ?
            this.$panels.get(index) :
            index
        ;

        if (!panel || !panel[componentExpando]) {
            return false;
        }
        return panel[componentExpando];
    }

    /**
     * Selects/opens a panel.
     * @param index {Number|Element}
     * @param options {Object} Options are passed to the open method of the panel instance.
     * @returns {Boolean}
     */
    selectIndex(index, options) {
        const component = this.getComponentByIndexOrDOM(index);
        return component && component.open(options);
    }

    /**
     * Closes a panel.
     * @param index {Number|Element}
     * @param options {Object} Options are passed to the close method of the panel instance.
     * @returns {Boolean}
     */
    deselectIndex(index, options) {
        const component = this.getComponentByIndexOrDOM(index);
        return component && component.close(options);
    }

    _switchOff() {
        if (this.$panels && this.$buttons) {
            this.setChildOption(this.$groupButtons, 'switchedOff', true);
            this.setChildOption(this.$buttons, 'switchedOff', true);
            this.setChildOption(this.$panels, 'switchedOff', true);
        }
        this.setSwitchedOffClass();
    }

    _switchOn() {
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
    }

    setOption(name, value, isSticky) {
        if (name == 'multiple' && value && !this.options.toggle) {
            this.setOption('toggle', true, isSticky);
        } else if (name == 'toggle' && value != this.options.toggle) {
            this.setChildOption(this.$buttons, 'type', value ? 'toggle' : 'open', isSticky);
        } else if (name == 'easing' && value && typeof value == 'string') {
            rb.addEasing(value);
        } else if (name == 'setFocus' || name == 'resetSwitchedOff' || name == 'closeOnEsc' || name == 'adjustScroll' || name == 'scrollIntoView' || name == 'setDisplay' || name == 'autofocusSel') {
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
            this.setChildOption(this.$groupButtons, name, value, isSticky);
            this.setChildOption(this.$buttons, name, value, isSticky);
        } else if(name == 'itemWrapper'){
            value = this.interpolateName(value);
            this.setChildOption(this.$panels, name, value, isSticky);
        }

        super.setOption(name, value, isSticky);

        if ((name == 'toggle' || name == 'multiple') && this.options.multiple && !this.options.toggle) {
            const that = this;
            setTimeout(function(){
                if (that.options.multiple && !that.options.toggle) {
                    that.setOption('toggle', true, isSticky);
                }
            });
        }
    }
}

rb.live.register('panelgroup', PanelGroup);

export default PanelGroup;

class PanelGroupButton extends components.button {

}

live.register('panelgroupbutton', PanelGroupButton);

/**
 * Class component to create a tab component. This component simply just changes some default options of the [panelgroup component]{@link rb.components.panelgroup}.
 * @alias rb.components.tabs
 * @extends rb.components.panelgroup
 *
 * @param element
 * @param initialDefaults
 *
 * @example
 * <div class="rb-tabs js-rb-click" data-module="tabs">
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
class Tabs extends components.panelgroup {

    /**
     * Changed options compared to the panelgroup component. Go to {@link rb.components.panelgroup#defaults} for detailed option descriptions.
     *
     * @static
     * @mixes rb.components.panelgroup.defaults
     * @property {Boolean}  toggle=false
     * @property {Number}  selectedIndex=0
     * @property {String}  animation='adaptHeight'
     */
    static get defaults(){
        return {
            selectedIndex: 0,
            toggle: false,
            animation: 'adaptHeight',
        };
    }
}

live.register('tabs', Tabs);

/**
 * Class component to create a accordion component. This component simply just changes some default options of the [panelgroup component]{@link rb.components.panelgroup}.
 * @alias rb.components.accordion
 * @extends rb.components.panelgroup
 *
 *
 * @example
 * <div class="rb-accordion js-rb-click" data-module="accordion">
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

class Accordion extends components.panelgroup {
    /**
     * Changed options compared to the panelgroup component. Go to {@link rb.components.panelgroup#defaults} for detailed option descriptions.
     *
     * @static
     * @mixes rb.components.panelgroup.defaults
     * @property {Boolean}  toggle=false
     * @property {Number}  selectedIndex=0
     * @property {String}  animation='slide'
     * @property {String}  adjustScroll=10
     */
    static get defaults(){
        return {
            selectedIndex: 0,
            toggle: false,
            animation: 'slide',
            adjustScroll: 10,
            itemWrapper: '.{name}{e}item',
        };
    }
}

live.register('accordion', Accordion);
