import rb, { Component } from '../core';

class Selectlist extends Component {

    static get events() {
        return {
            listboxchanged() {
                this.panelgroup.closeAll();
            },
        };
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.createSubComponents();
    }

    createSubComponents(){
        Promise.all([rb.live.import('panelgroup'),  rb.live.import('panelgroup')]).then(()=>{
            this.panelgroup = this.component('.{name}-panelgroup', 'panelgroup', {
                closeOnFocusout: true,
                autofocusSel: this.interpolateName('.{name}-listbox'),
                closeOnEsc: true,
            });

            this.listbox = this.component('.{name}-listbox', 'listbox');
        });
    }
}

Component.register('selectlist', Selectlist);

