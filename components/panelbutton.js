import rb, { Component } from '../core';
import './button';

/**
 * Class component to create a panelbutton. A panelbutton controls the state of a panel the same way an ordinary button does. Additionally the panelbutton associates with the panel and reflects it's state via an aria-expanded attribute.
 *
 * @name rb.components.panelbutton
 * @extends rb.components.button
 *
 * @param element
 * @param initialDefaults
 *
 * @example
 * <button data-target="next(.rb-panel)" data-module="panelbutton" type="button" class="js-rb-click">button</button>
 * <div class="rb-panel" data-module="panel">
 *    {{panelContent}}
 * </div>
 */
class PanelButton extends rb.components.button {

    /**
     * @static
     * @property {Object} defaults
     * @mixes rb.components.button.defaults
     *
     * @property {String} openTitle=""
     * @property {String} closedTitle=""
     */
    static get defaults(){
        return {
            openTitle: '',
            closedTitle: '',
        };
    }

    constructor(element, initialOpts) {
        super(element, initialOpts);

        this.rAFs({that: this, throttle: true}, 'updatePanelButtonState');
    }

    updatePanelButtonState() {
        var options = this.options;
        var isOpen = this.panelComponent.isOpen;
        var disable = !!(isOpen &&
        this.panelComponent.groupComponent &&
        this.panelComponent.groupComponent.options.toggle === false);

        this.element.setAttribute('aria-expanded', '' + isOpen);

        this.element.disabled = disable;

        if(options.closedTitle && options.openTitle){
            this.element.title = options[isOpen ? 'openTitle' : 'closedTitle'];
        }

        if (this._isFakeBtn) {
            this.element.setAttribute('aria-disabled', disable);
            this.element.setAttribute('tabindex', disable ? -1 : 0);
        }

    }

    _switchOff() {
        super._switchOff();

        this.element.removeAttribute('aria-expanded');

        if (this._isFakeBtn) {
            this.element.removeAttribute('role');
            this.element.removeAttribute('tabindex');
            this.element.removeAttribute('aria-disabled');
        }
    }

    _switchOn() {
        super._switchOn();
        if (!this.panelComponent) {
            this.associatePanel();
        } else {
            this.updatePanelButtonState();
        }
    }

    _setTarget(value) {
        var ret = super._setTarget(value);
        if(this.target){
            this.associatePanel();
        }
        return ret;
    }

    associatePanel() {
        var panelComponent;
        var panel = this.getTarget();

        if (!panel || !(panelComponent = this.component(panel)) || !('isOpen' in panelComponent) || this.panelComponent == panelComponent) {
            return;
        }

        if (this.panelComponent) {
            if (this.panelComponent.buttonComponent == this) {
                this.panelComponent.buttonComponent = null;
            }
            this.panelComponent.$element.off(this.panelComponent._evtName, this.updatePanelButtonState);
        }

        this.panelComponent = panelComponent;
        panelComponent.buttonComponent = this;
        panelComponent.$element.on(this.panelComponent._evtName, this.updatePanelButtonState);

        this.updatePanelButtonState();
    }
}

Component.register('panelbutton', PanelButton);

export default PanelButton;
