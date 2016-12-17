const rb = window.rb;

/**
 * Class component to create a {Name}.
 *
 * @alias rb.components.{name}
 *
 * @extends rb.Component
 *
 * @param element {Element}
 * @param [initialDefaults] {OptionsObject}
 *
 * @fires componentName#changed
 *
 * @example
 * <div class="js-rb-live" data-module="{name}"></div>
 */
class {Name} extends rb.Component {
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


    }
}

rb.live.register('{name}', {Name});

