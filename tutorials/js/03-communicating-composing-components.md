# Commmunicating between components and compsing components

For this tutorial we will build two very simple components. The first component is a native select element that controls the `isOpen` state of panels.

The markup of the component and its controlled elements looks like this:

```html
<select class="js-rb-click" data-module="selectcontrol">
	<option>Keine Auswahl</option>
    <option data-open-panel="panel-1">Opens panel 1</option>
    <option>Closes panel 2</option>
    <option>Opens panel 3</option>
</select>

<div id="panel-1" class="rb-panel">
    <p>Panel 1</p>
</div>
```

Due to the fact, that our component does only need to be initialized after the user interacts with it, we add the `js-rb-click` instead the `js-rb-live` class.
 
## The basic JS code

```js
class Selectcontrol extends rb.Component {

    static get events(){
        return {
            change: 'change'
        }
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.change();
    }

    change(){
        const openPanel = this.$queryAll(':checked').data('openPanel');

        if(openPanel){
            this.component(openPanel, 'panel').open();
        }
    }
}

rb.live.register('selectcontrol', Selectcontrol);
```

The 

