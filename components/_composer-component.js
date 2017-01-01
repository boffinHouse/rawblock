const rb = window.rb;
const childOptionExpando = rb.Symbol('childOptionExpando');

/**
 * Base Class component to create a _ComposerComponent.
 *
 * @alias rb.components._composer_component
 *
 * @extends rb.Component
 *
 * @param element {Element}
 * @param [initialDefaults] {OptionsObject}
 *
 */
class ComposerComponent extends rb.Component {

    _createChildOptions(componentName, opts, leaveOriginalName){
        const initialDefaults = {};

        if(!leaveOriginalName){
            initialDefaults.jsName = this.interpolateName(`{name}{e}${componentName}`, true);
            initialDefaults.name = this.interpolateName(`{name}{e}${componentName}`);
        }

        if(!this[childOptionExpando]){
            this[childOptionExpando] = {};
        }

        opts.forEach(option => {
            const optionName = typeof option == 'string' ?
                option :
                option.name
            ;
            const compute = option.computeValue;

            initialDefaults[optionName] = compute ?
                compute(this.options[optionName], optionName, this) :
                this.options[optionName]
            ;

            if(!this[childOptionExpando][optionName]){
                this[childOptionExpando][optionName] = {};
            }

            if(!this[childOptionExpando][optionName][componentName]){
                this[childOptionExpando][optionName][componentName] = {
                    components: [],
                    compute
                };
            }

        });

    }

    _createChildComponent(componentName, componentElement, initialDefaults, opts){
        const component = rb.getComponent(componentElement, componentName, initialDefaults);

        opts.forEach(option => {
            const optionName = typeof option == 'string' ?
                    option :
                    option.name
                ;

            this[childOptionExpando][optionName][componentName].components.push(component);
        });

        return component;
    }

    createChildComponent(componentName, componentElement, opts, leaveOriginalName){
        const initialDefaults = this._createChildOptions(componentName, opts, leaveOriginalName);

        return this._createChildComponent(componentName, componentElement, initialDefaults, opts);
    }

    createChildComponents(componentName, componentElements, opts, leaveOriginalName){
        const initialDefaults = this._createChildOptions(componentName, opts, leaveOriginalName);

        return componentElements
            .map((componentElement) => this._createChildComponent(componentName, componentElement, initialDefaults, opts));
    }

    setOption(name, value, isSticky){

        if(this[childOptionExpando] && this[childOptionExpando][name]){
            for(let optionName in this[childOptionExpando][name]){
                let option = this[childOptionExpando][name][optionName];
                let computedValue = option.compute ?
                    option.compute(value, name, this) :
                    value
                ;

                option.components.forEach((component)=>{
                    component.setOption(name, computedValue, isSticky);
                });
            }
        }

        super.setOption(name, value, isSticky);
    }
}

rb.live.register('_composer_component', ComposerComponent);

export default ComposerComponent;
