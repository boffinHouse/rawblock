#Accordion
<p class="docs-intro">List of items, allowing each item to hide or reveal additional content by clicking the header or button</p>

##Usage
To apply the accordion component add the `rb-accordion` class and attribute `data-module="accordion"` to an container element.
Inside this container you add items `accordion-item`. Each item has an header/button `accordion-btn` which open/close the according panel `accordion-panel`.


<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
	{{#with rb_accordion.default }}
		{{> rb_accordion }}
	{{/with}}
</div>


<h3 class="docs-example-title">Markup</h3>

```html
<div class="rb-accordion js-rb-life" data-module="accordion">
    <div class="accordion-item">
        <button type="button" class="accordion-btn">Heading 1</button>
        <div class="accordion-panel is-open">
            <div class="accordion-content">
               <p>Your Content</p>
            </div>
        </div>
    </div>
    ....
</div>
```

{{> docs_js_life }}

<hr>

##Panel Controls
Panels can also be open/closed with control buttons `accordion-ctr-btn`. The direction can be applied with attribute `data-type`

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
	{{#mergeJSON rb_accordion.default 'buttons: {"next": "next", "prev": "previous"}'}}
		{{> rb_accordion }}
	{{/mergeJSON}}
</div>


<h3 class="docs-example-title">Markup</h3>

```html
<div class="rb-accordion" data-module="accordion">
    <div class="accordion-controls">
        <button type="button" class="accordion-ctrl-btn" data-type="prev">prev</button>
        <button type="button" class="accordion-ctrl-btn" data-type="next">next</button>
    </div>
    <div class="accordion-item">...</div>
    <div class="accordion-item">...</div>
    <div class="accordion-item">...</div>
</div>
``` 

<hr>

##Multiple items open
To allow multiple panels to be open at the same time, add attribute `data-multiple` to the component container.


<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
	{{#mergeJSON rb_accordion.default 'attrs: {"multiple": true}'}}
		{{> rb_accordion }}
	{{/mergeJSON}}
</div>


<h3 class="docs-example-title">Markup</h3>

```html
<div class="rb-accordion" data-module="accordion" data-multiple="true">
    ...
</div>
```

<hr>

##JavaScript Options
Here you find the most important options settings for this component. The full list of options can be found in the JavaScript documentation.

<h3 class="docs-example-title">JS Options</h3>

| Option | Value | Default | Description |
| ------------- | ------------- | ------------- | ------------- |
| `multiple`  | Boolean | false | Allowed multiple panels to be open at the same time. If `true` then `toggle` is also automatically set to `true`. |
| `toggle`  | Boolean | false | Whether a panel button toggles the state of a panel. |
| `selectedIndex`  | Number | 0 | The initially opened index. If no panel with the class `is-open` was found. If no panel should be opened by default use -1. |
| `animation`  | String | 'slide' | Possible animations: `adaptHeight` or `slide`. These should be combined with CSS transitions or animations. |
| `adjustScroll`  | Boolean/Number | 10 | This option can be combined with the 'slide' animation in a accordion component. So that closing a large panel doesn't move the opening panel out of view. Possible values: `true`, `false`, any Number but not 0. |

<hr>

