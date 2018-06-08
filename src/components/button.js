import rb, { Component } from '../core';

/**
 * Class component to create a button.
 * @alias rb.components.button
 *
 * @extends rb.Component
 *
 * @param element
 * @param initialDefaults
 *
 * @example
 * ```html
 * <button type="button"
 *  data-module="button"
 *  class="js-rb-click"
 *  aria-controls="panel-1"
 *  data-button-type="open">
 *      click me
 * </button>
 * <div id="panel-1" data-module="panel"></div>
 * ```
 */
class Button extends Component {
    /**
     * @static
     *
     * @mixes rb.Component.defaults
     *
     * @property {Object} defaults
     * @property {String} defaults.target="" String that references the target element. Is processed by rb.elementFromStr.
     * @property {String} defaults.type="toggle" Method name to invoke on target component.
     * @property {Boolean} defaults.preventDefault=false Whether the default click action should prevented.
     * @property {*} defaults.args=null Arguments to be used to invoke target method.
     */
    static get defaults(){
        return {
            target: '',
            type: 'toggle',
            args: null,
            switchedOff: false,
        };
    }

    constructor(element, initialDefaults) {

        super(element, initialDefaults);

        this._isFakeBtn = !this.element.matches('input, button');
        this._resetPreventClick = this._resetPreventClick.bind(this);

        rb.rAFs(this, {throttle: true}, '_switchOff', '_switchOn', '_setAriaControls');

        this.setOption('args', this.options.args);

        if (!this.options.switchedOff) {
            this.setOption('switchedOff', false);
        }
    }

    static get events(){
        return {
            click: '_onClick',
            keydown(e) {
                if (this.options.switchedOff) {
                    return;
                }
                let target;

                const component = this.panelComponent ||
                    (target = this.getTarget()) && this.component(target);

                if (component && e.keyCode == 40 && this.element.getAttribute('aria-haspopup') == 'true') {
                    if (!('isOpen' in component) || !component.isOpen) {
                        this._onClick(e);
                    } else {
                        component.setComponentFocus();
                    }
                    e.preventDefault();
                } else {
                    this._delegateFakeClick(e);
                }
            },
            keyup: '_delegateFakeClick',
        };
    }

    _delegateFakeClick(e) {
        if (this.options.switchedOff) {
            return;
        }
        if (this._isFakeBtn && (e.keyCode == 32 || e.keyCode == 13)) {
            e.preventDefault();

            if ((e.type == 'keyup' && e.keyCode == 32) || (e.type == 'keydown' && e.keyCode == 13)) {
                this._onClick(e);
                this._preventClick = true;
                setTimeout(this._resetPreventClick, 33);
            }
        }
    }

    _resetPreventClick() {
        this._preventClick = false;
    }

    _simpleFocus(){
        try {
            if (this.element != document.activeElement) {
                this.element.focus();
            }
        } catch (e) {} // eslint-disable-line no-empty
    }

    _onClick(e) {
        let args;

        if (this.options.switchedOff || this._preventClick || this.element.disabled) {
            return;
        }

        const target = this.getTarget();
        const component = target && this.component(target);

        if (!component) {
            return;
        }

        if (e && this.options.preventDefault && e.preventDefault) {
            e.preventDefault();
        }

        if (this.options.type in component) {
            args = this.args;

            this._simpleFocus();

            component.activeButtonComponent = this;
            if (typeof component[this.options.type] == 'function') {
                component[this.options.type].apply(component, args);
            } else {
                component[this.options.type] = args;
            }
        }
    }

    setOption(name, value, isSticky) {
        super.setOption(name, value, isSticky);

        switch (name) {
            case 'target':
                this._setTarget(value);
                break;
            case 'args':
                if (value == null) {
                    value = [];
                } else if (!Array.isArray(value)) {
                    value = [value];
                }
                this.args = value;
                break;
            case 'switchedOff':
                if (value) {
                    this._switchOff();
                } else {
                    this._switchOn();
                }

                break;
        }
    }

    _switchOff() {
        if (this._isFakeBtn) {
            this.element.removeAttribute('role');
            this.element.removeAttribute('tabindex');
        }
    }

    _switchOn() {
        if (this._isFakeBtn) {
            this.element.setAttribute('role', 'button');
            this.element.setAttribute('tabindex', '0');
        }
    }

    _setAriaControls() {
        if(this.target){
            this.$element.attr({'aria-controls': this.getId(this.target)});
        }
    }

    /**
     * Changes/sets the target element.
     * @param {Element|String} [element]
     */
    _setTarget(element) {
        if(!element){
            element = this.options.target;
        }

        if(!element &&  !this.options.target){
            element = this.element.getAttribute('aria-controls');
        }

        this.target = (typeof element == 'string') ?
            this.getElementsByString(element)[0] :
            element
        ;

        this.targetAttr = element;

        this._setAriaControls();
    }

    /**
     * Returns the current target component of the button
     * @returns {Element}
     */
    getTarget() {
        const target = this.options.target || this.element.getAttribute('aria-controls');

        if (!this.target || (target != this.targetAttr && target)) {
            this._setTarget();
        }

        return this.target;
    }
}

Component.register('button', Button);

export default Button;
