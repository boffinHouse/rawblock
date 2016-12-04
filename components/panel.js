import './panelbutton';
import '../utils/rb$_slide-up-down';
import '../utils/rb_contains';

const rb = window.rb;
const $ = rb.$;
const regInputs = /^(?:input|textarea)$/i;

/**
 * Class component to create a panel. The visibility should be handled using CSS. The component mainly toggles the class `is-open`.
 * @alias rb.components.panel
 * @extends rb.Component
 *
 * @param element
 * @param initialDefaults
 *
 * @fires moduleName#change Fires before a panel's `isOpen` state changes. The default behavior can be prevented.
 * @fires moduleName#changed Fires after a panel's `isOpen` state changed.
 *
 * @property {Boolean} isOpen
 *
 * @example
 * <button aria-controls="panel-1" data-module="button" type="button" class="js-rb-click">button</button>
 * <div id="panel-1" data-module="panel">
 *    {{panelContent}}
 * </div>
 * @example
 * rb.$('.rb-panel').rbComponent().open();
 * rb.$('.rb-panel').on('panelchanged', function(){
 *      console.log(rb.$(this).rbComponent().isOpen);
 * });
 */
class Panel extends rb.Component {
    /**
     * @static
     * @mixes rb.Component.defaults
     * @property {Object} defaults
     * @property {String} defaults.animation='' Predefined animation: 'slide'. These should be combined with CSS transitions or animations.
     * @property {String} defaults.easing='' CSS Easing function for the animation.
     * @property {Number} defaults.duration=400 Duration of the animation.
     * @property {Boolean|String} defaults.setFocus=true Whether the component should set the focus on open. true: sets only focus if js-rb-autofocus is found. 'force': sets focus to panel, if no 'js-rb-autofocus' was found.
     * @property {Boolean} defaults.closeOnFocusout=false Similar to closeOnOutsideClick, but better from behavior. Caution behavior can be sometimes unpredictable, if multiple buttons do control the panel.
     * @property {Boolean} defaults.closeOnOutsideClick=false Whether the component should be closed, if clicked outside the component.
     * @prop {Boolean} defaults.switchedOff=false Turns off panel.
     * @prop {Boolean} defaults.resetSwitchedOff=true Resets panel to initial state on reset switch.
     * @prop {Boolean} defaults.closeOnEsc=false Whether panel should be closed on esc key.
     * @prop {Boolean|Number} defaults.adjustScroll=false If a panel closes and the activeElement is below the panel, the scroll position might be adjusted to hold the activeElement in view. The adjustScroll option can be combined with the 'slide' animation in a accordion component. So that closing a large panel doesn't move the opening panel out of view. Possible values: `true`, `false`, any Number but not 0.
     * @prop {Boolean|Number} defaults.scrollIntoView=false If a panel opens tries to scroll it into view.
     * @prop {String} defaults.itemWrapper='' Whether the closest itemWrapper should get the class `is-selected-within'.
     * @prop {Boolean|String} defaults.setDisplay=false Changes panel to display none if closed.
     * @prop {Number} defaults.displayTimer=5000 Sets time in ms for display setter.
     */
    static get defaults(){
        return {
            animation: '', // || 'slide'
            duration: 400,
            easing: '',
            setFocus: true, // true || false
            closeOnOutsideClick: false,
            resetSwitchedOff: true,
            switchedOff: false,
            closeOnEsc: false,
            closeOnFocusout: false,
            scrollIntoView: false,
            adjustScroll: false,
            itemWrapper: '',
            setDisplay: false,
            displayTimer: 5000,
        };
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.isOpen = this.element.classList.contains(rb.statePrefix + 'open');

        this.isDefaultOpen = this.isOpen;

        this._role = this.element.getAttribute('role');

        this._onBodyClick = this._onBodyClick.bind(this);
        this._onOutSideAction = this._onOutSideAction.bind(this);

        rb.rAFs(this, {throttle: true}, '_opened', '_closed', '_switchOn', '_switchOff');
        rb.rAFs(this, {throttle: true, that: this}, '_setDisplay');

        this.setOption('easing', this.options.easing);

        if (!this.options.switchedOff) {
            this.setOption('switchedOff', false);
        } else {
            rb.rAFQueue(function () {
                element.classList.add(rb.statePrefix + 'switched' + rb.nameSeparator + 'off');
            });
        }
    }

    static get events(){
        return {
            'click .{name}{e}close': function (e) {
                this.close();
                if (e) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            },
            'keydown:keycodes(27)': function(e){
                if(this.options.closeOnEsc && !e.defaultPrevented){
                    this.close();
                    e.preventDefault();
                    e.stopPropagation();
                }
            },
        };
    }

    _switchOff() {
        this.element.removeAttribute('aria-hidden');
        this.element.removeAttribute('role');
        this.element.removeAttribute('tabindex');

        if (this.options.resetSwitchedOff) {
            this.isOpen = this.isDefaultOpen;
        }

        if (!this.isDefaultOpen) {
            this.element.classList.remove(rb.statePrefix + 'open');
        }

        this.element.classList.add(rb.statePrefix + 'switched' + rb.nameSeparator + 'off');

        this.$element.css({
            visibility: '',
            height: '',
            overflow: '',
            display: '',
        });
    }

    _switchOn() {
        if (this.isOpen) {
            this.element.classList.add(rb.statePrefix + 'open');
        }

        this.element.classList.remove(rb.statePrefix + 'switched' + rb.nameSeparator + 'off');

        this.element.setAttribute('aria-hidden', '' + (!this.isOpen));

        this.$element.attr({'role': this._role || 'group', tabindex: '-1'});
    }

    _setDisplay(){
        if(!this.isOpen){
            this.element.style.display = 'none';
        } else if(this.element.style.display == 'none'){
            this.element.style.display = typeof this.options.setDisplay == 'string' ?
                this.options.setDisplay :
                ''
            ;
        }
        this._displayTimer = null;
    }

    _shouldTeardown(){
        if ((!this.isOpen && (!this.options.closeOnOutsideClick && this.options.closeOnFocusout)) || !rb.root.contains(this.element)) {
            this.teardownOnOpenEvts();
            return true;
        }
    }

    _onBodyClick(e) {
        var that;
        if (this.options.closeOnOutsideClick && !this._shouldTeardown() && document.body.contains(e.target) && !rb.contains(this.element, e.target)) {
            that = this;
            this._closeTimer = setTimeout(function () {
                that.close();
            }, 44);
        }
    }

    _onOutSideAction(e){
        var containers, component;

        if (this.options.closeOnFocusout && (e.type != 'focus' || e.target.tabIndex != -1) && document.body.contains(e.target) && !this._shouldTeardown()) {
            component = this.component(e.target);

            if(component && component.getTarget && component.getTarget() == this.element){
                return;
            }

            containers = [this.element];

            if(this.buttonComponent){
                containers.push(this.buttonComponent.element);
            }
            if(this.activeButtonComponent){
                containers.push(this.activeButtonComponent.element);
            }

            if(!rb.contains(containers, e.target)){
                this.close();
            }
        }
    }

    setupOnOpenEvts() {
        this.teardownOnOpenEvts();
        if(this.options.closeOnFocusout || this.options.closeOnOutsideClick){
            document.addEventListener('click', this._onBodyClick, true);
            document.addEventListener('mousedown', this._onOutSideAction, true);
            document.addEventListener('focus', this._onOutSideAction, true);
        }
    }

    teardownOnOpenEvts() {
        clearTimeout(this._closeTimer);
        document.removeEventListener('click', this._onBodyClick, true);
        document.removeEventListener('mousedown', this._onOutSideAction, true);
        document.removeEventListener('focus', this._onOutSideAction, true);
    }

    setOption(name, value) {
        this._super(name, value);

        if (name == 'easing' && value && typeof value == 'string') {
            rb.addEasing(value);
        } else if (name == 'switchedOff') {
            if (value) {
                this._switchOff();
            } else {
                this._switchOn();
            }
        }
    }

    getAnimationData(){
        var animationComponent;
        var panel = this;

        var animationData = {
            panel: panel,
            options: {},
        };

        if (panel.options.animation) {
            animationComponent = this;
        } else if (this.options.animation !== false && this.groupComponent) {
            animationComponent = this.groupComponent;
        }

        if(animationComponent){
            animationData.component = animationComponent;
            animationData.options = {
                duration: animationComponent.options.duration,
                easing: animationComponent.options.easing
            };
            animationData.animation = animationComponent.options.animation;
        }

        return animationData;
    }

    _handleAnimation(e) {
        var $panel;
        var panel = this;
        var animationData = {};

        if (e.defaultPrevented || !e.detail || e.detail.animationPrevented) {
            return animationData;
        }

        animationData = this.getAnimationData();
        $panel = this.$element;

        if (!animationData.component) {
            return animationData;
        }

        if(panel.groupComponent && panel.groupComponent._handleAnimation){
            panel.groupComponent._handleAnimation(animationData);
        }

        if(animationData.animation == 'slide'){
            $panel.stop();
            if (panel.isOpen) {
                animationData.options.getHeight = true;
                animationData.height = $panel.rbSlideDown(animationData.options);
            } else {
                animationData.height = 0;
                $panel.rbSlideUp(animationData.options);
            }
        }
        return animationData;
}

    /**
     * Opens the panel
     * @param {Object} [options] Options are also dispatched with the event.detail property.
     * @param {Boolean} [options.animationPrevented] If `true` panel opens without animation.
     * @param {Boolean} [options.setFocus] Overrides the general `setFocus` option of the component instance.
     * @returns {boolean}
     * @example
     * //opens a panel without animation and without setting focus.
     * rb.$('.rb-panel').rbComponent().open({animationPrevented: true, setFocus: false});
     */
    open(options) {
        if (this.isOpen) {
            return false;
        }
        var setFocus;
        var mainOpts = this.options;
        var changeEvent = this.trigger(this._beforeEvtName, options);

        if(!options){
            options = {};
        }

        if (changeEvent.defaultPrevented) {
            return false;
        }

        setFocus = 'setFocus' in options ?
            options.setFocus :
            mainOpts.setFocus
        ;

        this.isOpen = true;

        if (this.groupComponent) {
            this.groupComponent.panelChangeCB(this, 'beforeopen');
        }

        clearTimeout(this._closeTimer);
        if(this._displayTimer){
            clearTimeout(this._displayTimer);
        }

        options.animationData = this._handleAnimation(changeEvent);

        if (setFocus && !options.focusElement) {
            options.focusElement = this.getFocusElement(setFocus == 'force');
        }

        if(options.focusElement && regInputs.test(options.focusElement.nodeName)){
            this._opened._rbUnrafedFn.call(this, options);
        } else {
            this._opened(options);
        }
        return true;
    }

    _getFocusDelay(actionOptions) {
        var mainOpts = this.options;
        var delay = (actionOptions && actionOptions.focusDelay) || (mainOpts.animation && mainOpts.duration) ||
                (this.groupComponent && this.groupComponent.options.animation && this.groupComponent.options.duration)
            ;

        return delay || mainOpts.focusDelay || 0;
    }

    _opened(options) {
        if(!this.isOpen){return;}
        var delay = this._getFocusDelay(options);

        this.element.classList.add(rb.statePrefix + 'open');
        this.element.setAttribute('aria-hidden', 'false');

        if(this.options.setDisplay){
            this._setDisplay();
        }

        if(this.options.itemWrapper){
            $(this.element.closest(this.interpolateName(this.options.itemWrapper)))
                .rbChangeState('selected{-}within', true);
        }

        if (this.groupComponent) {
            this.groupComponent.panelChangeCB(this, 'afteropen');
        }

        if (options.focusElement) {
            this.setComponentFocus(options.focusElement, delay);
        } else {
            this.storeActiveElement();
        }
        clearTimeout(this._closeTimer);
        if (this.options.closeOnOutsideClick) {
            this.setupOnOpenEvts();
        }

        this.scrollIntoView(options);

        this.trigger();
    }

    /**
     * Toogles the panel
     * @param {Object} [options] Options are also dispatched with the event.detail property.
     * @returns {boolean}
     * @example
     * rb.$('.rb-panel').rbComponent().toggle();
     */
    toggle(options) {
        return this[this.isOpen ? 'close' : 'open'](options);
    }

    /**
     * Closes the panel
     * @param {Object} [options] Options are dispatched with the event.detail property.
     * @param {Boolean} [options.animationPrevented] If `true` panel closes without animation.
     * @returns {boolean}
     * @example
     * rb.$('.rb-panel').rbComponent().close();
     */
    close(options) {
        if (!this.isOpen) {
            return false;
        }
        var changeEvent = this.trigger(this._beforeEvtName, options);

        if (changeEvent.defaultPrevented) {
            return false;
        }

        this.isOpen = false;

        if (this.groupComponent) {
            this.groupComponent.panelChangeCB(this, 'beforeclose');
        }

        this.adjustScroll();

        this._handleAnimation(changeEvent);

        this._closed(options);
        clearTimeout(this._closeTimer);
        return true;
    }

    _closed(options) {
        if(this.isOpen){return;}

        this.element.classList.remove(rb.statePrefix + 'open');
        this.element.setAttribute('aria-hidden', 'true');

        if(this.options.itemWrapper){
            $(this.element.closest(this.interpolateName(this.options.itemWrapper)))
                .rbChangeState('selected{-}within');
        }

        if (this.groupComponent) {
            this.groupComponent.panelChangeCB(this, 'afterclose');
        }

        this.trigger();

        clearTimeout(this._closeTimer);

        if (this.options.closeOnOutsideClick) {
            this.teardownOnOpenEvts();
        }

        if ((!options || options.setFocus !== false) && (this.options.setFocus || (options && options.setFocus))) {
            this.restoreFocus(true);
        }

        if(this._displayTimer){
            clearTimeout();
        }

        if(this.options.setDisplay){
            this._displayTimer = setTimeout(this._setDisplay, this.options.displayTimer || 5000);
        }
    }

    _scroll(relPos, animationData){
        var scrollingElement, scrollTop;

        if (relPos) {
            scrollingElement = rb.getPageScrollingElement();

            scrollTop = Math.max(scrollingElement.scrollTop + relPos, 0);

            if(animationData.animation){
                $(scrollingElement)
                    .animate(
                        {
                            scrollTop: scrollTop,
                        },
                        animationData.options
                    )
                ;
            } else {
                scrollingElement.scrollTop = scrollTop;
            }
        }
}

    scrollIntoView(opts){
        var activeElement, animationData, box, viewHeight, comparePos,
            elemHeight, scrollTop;
        var options = this.options;

        if(!options.scrollIntoView){return;}


        activeElement = document.activeElement;

        if(!activeElement || !activeElement.compareDocumentPosition ||
            !(comparePos = activeElement.compareDocumentPosition(this.element)) ||
            (comparePos != 4 && comparePos != 2)){
            return;
        }

        animationData = opts.animationData;
        box = this.element.getBoundingClientRect();
        viewHeight = rb.root.clientHeight;
        elemHeight = animationData.height || box.height;

        if(comparePos == 4 && box.top + elemHeight > viewHeight){
            scrollTop = box.top + Math.min(elemHeight, viewHeight - 9) - viewHeight;
        } else if(comparePos == 2 && box.top < 0) {
            scrollTop = box.top;
        }

        if(scrollTop){
            if(typeof options.scrollIntoView == 'number'){
                scrollTop += options.scrollIntoView;
            }
            this._scroll(scrollTop, animationData);
        }
    }

    adjustScroll(){
        var activeElement, animationData, height;
        var options = this.options;
        var adjustScroll = options.adjustScroll;
        if(!adjustScroll){return;}

        activeElement = document.activeElement;

        if(!activeElement || !activeElement.compareDocumentPosition ||
            activeElement.compareDocumentPosition(this.element) != 2){
            return;
        }

        animationData = this.getAnimationData();
        height = this.$element.outerHeight();

        if (typeof adjustScroll == 'number') {
            height -= activeElement.getBoundingClientRect().top - adjustScroll;
        }

        if(height > 0){
            this._scroll(height * -1, animationData);
        }
    }
}

rb.live.register('panel', Panel);

export default Panel;
