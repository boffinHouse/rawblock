import mobx from 'mobx';
import data from './a_state';

const rb = window.rb;

rb.log(data, mobx);

/**
 * Class component to create a A.
 *
 * @alias rb.components.a
 *
 * @extends rb.Component
 *
 * @param element {Element}
 * @param [initialDefaults] {OptionsObject}
 *
 * @fires componentName#changed
 *
 * @example
 * <div class="js-rb-live" data-module="a"></div>
 */
class A extends rb.Component {
    /**
     * @static
     * @mixes rb.Component.defaults
     *
     * @prop {String} foo='bar'
     */
    static get defaults() {
        return {};
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);
        this.renderFoo = mobx.autorun(this.renderFoo.bind(this));
    }

    renderFoo(){
        this.$element.htmlRaf(data.foo);
    }
}

rb.live.register('a', A);

