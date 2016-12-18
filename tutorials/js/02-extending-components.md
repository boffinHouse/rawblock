# Extending a rawblock component (panelgroup)

For this tutorial we will generate some kind of a select list of checkboxes or radio buttons, that opens on a button click.

The final demo can be seen on [codepen](http://codepen.io/aFarkas/pen/RoEpby).

As a base we will use the [panelgroup component](rb.components.panelgroup.html). A similar component could also be build with the [popover component](rb.components.popover.html)

## Extend the panelgroup

First we extend the panelgroup component and register our new component class with the name `checklist`:

```js
import 'rawblock/components/panelgroup';

const rb = window.rb;

class CheckList extends rb.components.panelgroup {

}

rb.live.register('checklist', CheckList);

export default CheckList;

```

### Excursion: The "name" feature of rawblock.

In rawblock events and the CSS classes for elements are prefixed with the component name. For example panels and panelbutton elements for the panelgroup component have the class `.panelgroup-panel`/`.panelgroup-btn`. 

Our checklist component changes this now to `.checklist-panel` and `.checklist-btn`. Rawblock has the concept of basically 3 different names:

* componentName: This is the name that was used to register the component and has to be used in the `data-module` attribute as also for changing options via the `data-*` attributes.
* htmlName (defaults to the componentName): This is the name that is used to prefix element classes and can be changed via the `name` option. This is especially useful to create new CSS components based on an unmodified normal JS component.
```html
<style type="text/scss">
    .herotabs {
        @include rb-js-export((
            name: herotabs,
        ));
    }
</style>
<div class="herotabs js-rb-click" data-module="tabs">
    <button class="herotabs-btn" type="button" aria-expanded="true">Tab 1</button>
    <button class="herotabs-btn" type="button">Tab 2</button>
    <div class="herotabs-panel-wrapper">
        <div class="herotabs-panel">Panel 1</div>
        <div class="herotabs-panel">Panel 2</div>
    </div>
</div>
</div>
```
* jsName (defaults to the componentName): This is the name that is used to prefix the events which are dispatched by the component. This option can be changed using the `jsName` option. In most cases you wont change this option.

Rawblock gives the developer some methods to deal with these dynamic naming. A developer should use the placeholder `{name}` in the event object as also inside of method calls like (`this.query`, `this.queryAll`, `this.$queryAll`, `this.getElementsByString`, `this.component`). Rawblock also gives a primitive `this.interpolateName` to deal with this.

Of course you are not forced to use this in your components, but we highly recommend it.

## Checklist markup

Our component markup will now look like this. There are 3 different inerhited behavior elements in our component. (`checklist-btn`, `checklist-panel` and `checklist-panel-close`). 

```html
<div class="rb-checklist js-rb-live" data-module="checklist" role="group" aria-label="Auswahlliste">
    <button class="checklist-btn" type="button">
        <span class="checklist-value">Auswählen</span>
    </button>
    <div class="checklist-panel">
        <div class="checklist-panel-box">
            <label class="checklist-option"><input type="radio" name="foo"> Option 1</label>
            <label class="checklist-option"><input type="radio" name="foo"> Option 2</label>
            <label class="checklist-option"><input type="radio" name="foo"> Option 3</label>
            <label class="checklist-option"><input type="radio" name="foo"> Option 4</label>
            <label class="checklist-option"><input type="radio" name="foo"> Option 5</label>
        </div>
    </div>
</div>


<div class="rb-checklist js-rb-live" data-module="checklist" role="group" aria-label="Auswahlliste">
    <button class="checklist-btn" type="button">
        <span class="checklist-value">Auswählen</span>
    </button>
    <div class="checklist-panel">
        <div class="checklist-panel-box">
            <label class="checklist-option"><input type="checkbox"> Option 1</label>
            <label class="checklist-option"><input type="checkbox"> Option 2</label>
            <label class="checklist-option"><input type="checkbox"> Option 3</label>
            <label class="checklist-option"><input type="checkbox"> Option 4</label>
            <label class="checklist-option"><input type="checkbox"> Option 5</label>
            <button type="button" class="checklist-panel-close">close</button>
        </div>
    </div>
</div>
```

We can additionally improve the behavior of the component by adding the attribute `aria-haspopup="true"`. This tells rawblocks `button` component to not only run the default action on click but also if the cursor down key (with the alt key) is pressed.

```html
<button class="checklist-btn" type="button" aria-haspopup="true">
    <span class="checklist-value">Auswählen</span>
</button>
```

Additionally we can change some of the panelgroup default options:

```js
class CheckList extends rb.components.panelgroup {
   static get defaults() {
        return {
            closeOnFocusout: true,
            autofocusSel: 'input[type="checkbox"], input[type="radio"]',
            closeOnEsc: true,
        };
    }
}
```

## Adding some custom logic to our component.

We are now pretty close to our final component behavior. 

What we need to change is add the label text of the selected options into our `.checklist-value` element.

To do this, we first save the current value `.checklist-value` as a default value and then check write the function to update its content.

```js
class CheckList extends rb.components.panelgroup {

    //...

    initItemOptions(){
        // get the value element
        this.valueElement = this.query('.{name}-value');

        // ... and save the textContent as the defaultValue.
        this.defaultValue = this.valueElement && this.valueElement.textContent || '';
        this.currentValue = this.defaultValue;
    }
        
    static get events(){
        return {
            // run updateValue everytime a checkbox/rawdio button changes
            'change:matches(input[type="checkbox"], input[type="radio"])': 'updateValue',
        };
    }

    updateValue(){
        // get the textContent of all checked options
        const currentValue = this.queryAll(':checked')
                .map(CheckList.getLabelContent).join(', ') ||
            this.defaultValue
        ;

        // if it has changed update the value element
        if(currentValue != this.currentValue){
            this.currentValue = currentValue;
            this._updateValue();
        }
    }
    
    static getLabelContent(input){
        return input.closest('label, li').textContent;
    }

    _updateValue(){
        if(this.valueElement){
            this.valueElement.innerText = this.currentValue;
        }
        
        //trigger checklistvaluechanged
        this.trigger('valuechanged');
    }
}
```

Additionally we also want to automatically close the list if a radio button, but not a checkbox was changed. To do this we refactor the change handler. The panelgroup gives us a nice method called [`closeAll`](rb.components.panelgroup.html#closeAll__anchor) to do exactly this.

```js
class CheckList extends rb.components.panelgroup {

    static get defaults() {
        return {
            closeOnFocusout: true,
            autofocusSel: 'input[type="checkbox"], input[type="radio"]',
            closeOnEsc: true,
        };
    }

    static get events(){
        return {
            'change:matches(input[type="checkbox"], input[type="radio"])': function(e, _superHandler){
                if(e.target.type == 'radio'){
                    this.closeAll();
                }

                this.updateValue();
            },
        };
    }
}
```

The event handler is not only passed the event object, but also a function, that will invoke a possible overridden handler defined in a super class.

### A11y fixes
 
Unfortunately the `change` event is also dispatched by using the keyboard to navigate in the radio group. To only close the list if it was handled by mouse we add a `mouseup` listener.
 
Our final component JS looks now like this:

```js
import './panelgroup';

const rb = window.rb;

class CheckList extends rb.components.panelgroup {

    static get defaults() {
        return {
            closeOnFocusout: true,
            autofocusSel: 'input[type="checkbox"], input[type="radio"]',
            closeOnEsc: true,
        };
    }

    static get events(){
        return {
            'mouseup:closest(.{name}-panel)': function(_e, _superHandler){
                this._allowOptionClose = true;

                clearTimeout(this._allowOptionCloseTimer);
                this._allowOptionCloseTimer = setTimeout(()=>{
                    this._allowOptionClose = false;
                }, 9);
            },
            'change:matches(input[type="checkbox"], input[type="radio"])': function(e, _superHandler){
                if(this._allowOptionClose && e.target.type == 'radio'){
                    this.closeAll();
                }

                this.updateValue();
            },
        };
    }
    
    static getLabelContent(input){
        return input.closest('label, li').textContent;
    }

    constructor(element, initialDefaults){
        super(element, initialDefaults);

        this.rAFs('_updateValue');

        this.initItemOptions();
        this.updateValue();
    }

    initItemOptions(){
        this.valueElement = this.query('.{name}-value');

        this.defaultValue = this.valueElement && this.valueElement.textContent || '';
        this.currentValue = this.defaultValue;
    }

    updateValue(){
        const currentValue = this.queryAll(':checked')
                .map(CheckList.getLabelContent).join(', ') ||
            this.defaultValue
        ;

        if(currentValue != this.currentValue){
            this.currentValue = currentValue;
            this._updateValue();
        }
    }

    _updateValue(){
        if(this.valueElement){
            this.valueElement.innerText = this.currentValue;
        }
        this.trigger('valuechanged');
    }
}

rb.live.register('checklist', CheckList);

export default CheckList;
```

As a small refinement you can now add a simple animation to the component.

```scss
.rb-checklist {
    @include rb-js-export((
        animation: slide,
    ));
}
```

[final codepen demo](http://codepen.io/aFarkas/pen/RoEpby).
