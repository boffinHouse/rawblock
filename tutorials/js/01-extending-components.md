

```js
import 'rawblock/components/panelgroup';

const rb = window.rb;

class CheckList extends rb.components.panelgroup {

}

rb.live.register('checklist', CheckList);

export default CheckList;

```

## Excursion: The "name" feature of rawblock.

```html
<div class="rb-checklist js-rb-live" data-module="checklist" role="group" aria-label="Auswahlliste">
    <button class="checklist-btn" type="button">
        <span class="checklist-value">Auswählen</span>
    </button>
    <div class="checklist-panel">
        <label class="checklist-option"><input type="radio" name="foo"> Option 1</label>
        <label class="checklist-option"><input type="radio" name="foo"> Option 2</label>
        <label class="checklist-option"><input type="radio" name="foo"> Option 3</label>
        <label class="checklist-option"><input type="radio" name="foo"> Option 4</label>
        <label class="checklist-option"><input type="radio" name="foo"> Option 5</label>
    </div>
</div>


<div class="rb-checklist js-rb-live" data-module="checklist" role="group" aria-label="Auswahlliste">
    <button class="checklist-btn" type="button">
        <span class="checklist-value">Auswählen</span>
    </button>
    <div class="checklist-panel">
        <label class="checklist-option"><input type="checkbox"> Option 1</label>
        <label class="checklist-option"><input type="checkbox"> Option 2</label>
        <label class="checklist-option"><input type="checkbox"> Option 3</label>
        <label class="checklist-option"><input type="checkbox"> Option 4</label>
        <label class="checklist-option"><input type="checkbox"> Option 5</label>
        <button type="button" class="checklist-panel-close">close</button>
    </div>
</div>
```

```html
<button class="checklist-btn" type="button" aria-haspopup="true">
    <span class="checklist-value">Auswählen</span>
</button>
```


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
            'mouseup:closest(.{name}-option)': function(_e, _superHandler){
                this._allowOptionClose = true;

                clearTimeout(this._allowOptionCloseTimer);
                this._allowOptionCloseTimer = setTimeout(()=>{
                    this._allowOptionClose = false;
                }, 9);
            },
            'click:matches(input[type="checkbox"], input[type="radio"])': function(e, _superHandler){

                if(this._allowOptionClose && e.target.type == 'radio'){
                    this.closeAll();
                }

                this.updateValue();
            },
        };
    }

    constructor(element, initialDefaults){
        super(element, initialDefaults);

        this.rAFs('_updateValue');

        this.initItemOptions();
    }

    initItemOptions(){
        this.value = this.query('.{name}-value');

        this.defaultValue = this.value && this.value.textContent || '';
        this.currentValue = this.defaultValue;
    }

    updateValue(){
        const currentValue = this.queryAll(':checked')
                .map(input => input.closest('label').textContent).join(', ') ||
            this.defaultValue
        ;

        if(currentValue != this.currentValue){
            this.currentValue = currentValue;
            this._updateValue();
        }
    }

    _updateValue(){
        if(this.value){
            this.value.innerText = this.currentValue;
        }
        this.trigger('valuechanged');
    }
}

rb.live.register('checklist', CheckList);

export default CheckList;
```

```html

<div class="rb-checklist js-rb-live" data-module="checklist" role="group" aria-label="Auswahlliste">
    <button class="checklist-btn" type="button" aria-haspopup="true">
        <span class="checklist-value">Auswählen</span>
    </button>
    <div class="checklist-panel">
        <label class="checklist-option"><input type="radio" name="foo"> Option 1</label>
        <label class="checklist-option"><input type="radio" name="foo"> Option 2</label>
        <label class="checklist-option"><input type="radio" name="foo"> Option 3</label>
        <label class="checklist-option"><input type="radio" name="foo"> Option 4</label>
        <label class="checklist-option"><input type="radio" name="foo"> Option 5</label>
    </div>
</div>


<div class="rb-checklist js-rb-live" data-module="checklist" role="group" aria-label="Auswahlliste">
    <button class="checklist-btn" type="button">
        <span class="checklist-value">Auswählen</span>
    </button>
    <div class="checklist-panel">
        <label class="checklist-option"><input type="checkbox"> Option 1</label>
        <label class="checklist-option"><input type="checkbox"> Option 2</label>
        <label class="checklist-option"><input type="checkbox"> Option 3</label>
        <label class="checklist-option"><input type="checkbox"> Option 4</label>
        <label class="checklist-option"><input type="checkbox"> Option 5</label>
        <button type="button" class="checklist-panel-close">close</button>
    </div>
</div>
```

```scss
.checklist-btn {
    background: rgba(180, 180, 180, 0.6);

    &[aria-expanded="true"] {
        background: rgba(120, 120, 120, 0.6);
    }
}

.checklist-panel {
    display: none;
    position: absolute;
    padding: 10px;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid rgba(0, 0, 0, 0.8);

    &.is-open {
        display: block;
    }
}

.checklist-option {
    display: block;
}
```
