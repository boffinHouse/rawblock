import rb, { Component } from '../core';
import './panel';
import '../utils/position';


const $ = Component.$;

const Position = rb.Position;

/**
 * Creates a popover that is positioned/anchored to another element.
 *
 * A11y-Notes: If the popover has structured content use the class `js-rb-autofocus` inside of/at the popover. If it contains simple text use a aria-live="polite" or an appropriate role.
 *
 * @alias rb.components.popover
 *
 * @extends rb.components.panel
 *
 * @param element
 * @param initialDefaults
 *
 * @example
 * <button aria-controls="popover-1" data-module="panelbutton" type="button" class="js-rb-click">button</button>
 * <div id="popover-1" data-module="popover">
 *    {{popoverContent}}
 * </div>
 */
class Popover extends rb.components.panel {
    /**
     * @static
     * @mixes rb.components.panel.defaults
     *
     * @property {Object} defaults
     * @prop {Boolean} positioned=true indicates wether the panel is positioned
     * @prop {String} my='center bottom' Indicates the position of the panel. First x than y. Possible values for x 'left', 'center', 'right'. Possible values for y: 'top', 'middle', 'bottom'. Or numeric value: '0' indicates 'left' or 'top' and '50' 'center'/'middle'
     * @prop {String} at='center top' Indicates the position of the anchor element. Same possible values as 'my'
     * @prop {String} collision='flip' The collision handling. Possible values: 'flip', 'none'. Can be declared separatly for x and y. (i.e. 'flip none')
     * @prop {String} anchor='button' The anchor element to position the panel against. 'button' means the associated panelbutton module or if no associated panelbutton is found the opening button module. Accepts als string that are processed with rb.elementFromStr.
     * @prop {Boolean} updateOnResize=true Wether panel position should be updated on resize.
     * @prop {Boolean} closeOnOutsideClick=true Closes panel on outside click.
     * @prop {Boolean} closeOnEsc=true Closes panel on ESC keydown.
     * @prop {Boolean|String} setDisplay=true Changes panel option setDisplay to true.
     */
    static get defaults(){
        return {
            positioned: true,
            my: 'center bottom',
            at: 'center top',
            collision: 'flip',
            anchor: 'button', // 'button' || 'activeButton' || 'id' || closest(.bla) || sel(.yo)
            updateOnResize: true,
            closeOnOutsideClick: true,
            closeOnEsc: true,
            setDisplay: true,
        };
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.reflow = rb.throttle(this._reflow, {that: this});
        this.scrollRepostion = this.scrollRepostion.bind(this);

        if (this.options.positioned) {
            this.setOption('positioned', true);
        }
    }

    setOption(name, value, isSticky) {
        const options = this.options;
        super.setOption(name, value, isSticky);

        if (name == 'positioned') {
            if (value) {
                if (!this.position) {
                    this.initPositionedElement();
                } else {
                    this.$element.css({position: 'absolute'});
                }
            } else {
                this.$element.css({position: '', left: '', top: ''});
            }
        } else if (this.position && name == 'my' || name == 'at' || name == 'collision') {
            this.position.setOptions({
                my: options.my,
                at: options.at,
                collision: options.collision,
            });
        }
    }

    initPositionedElement() {
        var that = this;

        this.position = new Position(this.element);

        rb.rAFQueue(function () {
            that.$element.css({display: 'block'});
        });
        this.setOption('my', this.options.my);
    }

    _reflow(e) {
        if (!rb.root.contains(this.element)) {
            this.teardownPopoverResize();
            return;
        }
        if ((!e || this.options.updateOnResize)) {
            this.connect(false, this.lastOpeningOptions);
        }
    }

    scrollRepostion(e){
        if (!rb.root.contains(this.element)) {
            this.teardownPopoverResize();
            return;
        }

        if(!e || (this.options.updateOnResize && e.target.contains &&
            this.getAnchor(this.lastOpeningOptions))){
            this._reflow();
        }
    }

    setupPopoverResize() {
        this.teardownPopoverResize();
        window.addEventListener('resize', this.reflow);
        document.addEventListener('scroll', this.scrollRepostion, true);
    }

    teardownPopoverResize() {
        window.removeEventListener('resize', this.reflow);
        document.removeEventListener('scroll', this.scrollRepostion, true);
    }

    getAnchor(options) {
        let anchor = options && options.anchor || this.options.anchor || '';

        if (anchor.nodeType != 1) {
            if (anchor == 'activeButton') {
                anchor = (this.activeButtonComponent && this.activeButtonComponent.element) || (this.buttonComponent && this.buttonComponent.element);
            } else if (Popover.mainbutton[anchor]) {
                anchor = (this.buttonComponent && this.buttonComponent.element) || (this.activeButtonComponent && this.activeButtonComponent.element);
            } else if (typeof anchor == 'string') {
                anchor = rb.elementFromStr(anchor, this.element)[0];
            }
        }

        return anchor;
    }

    connect(isOpening, options) {
        const anchor = (isOpening || this.isOpen) && this.getAnchor(options);

        if (anchor && this.position) {
            this.position.connect(anchor);
        }
    }

    /**
     * Opens the popover
     * @param {Object} options
     * @param {String|Element} options.anchor Overrides anchor option of instance for current opening.
     * @returns {Boolean}
     */
    open(options) {
        const isOpening = super.open(options);
        this.lastOpeningOptions = options;

        if (this.options.positioned) {
            if($.css(this.element, 'display') == 'none'){
                this.element.style.display = typeof this.options.setDisplay == 'string' ?
                    this.options.setDisplay :
                    'block'
                ;
            }

            this.connect(isOpening, options);

            if (isOpening && this.options.updateOnResize) {
                this.setupPopoverResize();
            }
        }

        return isOpening;
    }

    close(_options) {
        const isClosing = super.close(_options);

        if (this.options.positioned) {
            if (isClosing) {
                this.lastOpeningOptions = null;
                this.teardownPopoverResize();
            }
        }

        return isClosing;
    }
}

Object.assign(Popover, {
    mainbutton: {
        button: 1,
        mainButton: 1,
        panelButton: 1,
    },
});

Component.register('popover', Popover);

export default Popover;
