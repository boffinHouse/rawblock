let focusClass, focusSel;

const rb = window.rb;


const generateFocusClasses = function(){
    focusClass = ['js', 'rb', 'autofocus'].join(rb.nameSeparator);
    focusSel = '.' + focusClass;
};

/**
 * Base Class component to create a _FocusComponent.
 *
 * @alias rb.components._focus_component
 *
 * @extends rb.Component
 *
 * @param element {Element}
 * @param [initialDefaults] {OptionsObject}
 *
 */
class _FocusComponent extends rb.Component {
    /**
     * @static
     * @mixes rb.Component.defaults
     *
     * @prop {Number} defaults.focusDelay=0 Default focus delay for `setComponentFocus`. Can be used to avoid interference between focusing and an animation.
     * @prop {String} defaults.autofocusSel='' Overrides the js-rb-autofocus selector for the component.
     */
    static get defaults() {

        return {
            focusDelay: 0,
            autofocusSel: '',
        };
    }

    beforeConstruct(){
        super.beforeConstruct();

        if(!focusClass){
            generateFocusClasses();
        }
    }

    /**
     *
     * @param [element] {Element|Boolean|String} The element that should be focused. In case a string is passed the string is converted to an element using `rb.elementFromStr`
     * @returns {undefined|Element}
     */
    getFocusElement(element){
        let focusElement;

        if (element && element !== true) {
            if (element.nodeType == 1) {
                focusElement = element;
            } else if (typeof element == 'string') {
                focusElement = rb.elementFromStr(element, this.element)[0];
            }
        } else {
            focusElement = this.options.autofocusSel &&
                this.query(this.options.autofocusSel) ||
                this.query(focusSel);
        }

        if (!focusElement && (element === true || this.element.classList.contains(focusClass))) {
            focusElement = this.element;
        }
        return focusElement;
    }

    /**
     * Sets the focus and remembers the activeElement before. If setComponentFocus is invoked with no argument. The element with the class `js-rb-autofocus` inside of the component element is focused.
     * @param [element] {Element|Boolean|String} The element that should be focused. In case a string is passed the string is converted to an element using `rb.elementFromStr`
     * @param [delay] {Number} The delay that should be used to focus an element.
     */
    setComponentFocus(element, delay) {
        let focusElement;

        if (typeof element == 'number') {
            delay = element;
            element = null;
        }

        focusElement = (!element || element.nodeType != 1) ?
            this.getFocusElement(element) :
            element
        ;

        this.storeActiveElement();

        if (focusElement) {
            this.setFocus(focusElement, delay || this.options.focusDelay);
        }
    }

    /**
     * stores the activeElement for later restore.
     *
     * @returns {Element}
     *
     * @see rb.Component.prototype.restoreFocus
     */
    storeActiveElement(){
        const activeElement = document.activeElement;

        this._activeElement = (activeElement && activeElement.nodeName) ?
            activeElement :
            null;

        return this._activeElement;
    }

    /**
     * Restores the focus to the element, that had focus before `setComponentFocus` was invoked.
     * @param [checkInside] {Boolean} If checkInside is true, the focus is only restored, if the current activeElement is inside the component itself.
     * @param [delay] {Number}
     */
    restoreFocus(checkInside, delay) {
        const activeElem = this._activeElement;

        if (!activeElem) {
            return;
        }

        if (typeof checkInside == 'number') {
            delay = checkInside;
            checkInside = null;
        }

        this._activeElement = null;
        if (!checkInside || this.element == document.activeElement || this.element.contains(document.activeElement)) {
            this.setFocus(activeElem, delay || this.options.focusDelay);
        }
    }
}

rb.live.register('_focus_component', _FocusComponent);

export default _FocusComponent;
