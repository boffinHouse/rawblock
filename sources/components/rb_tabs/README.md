#Tabs
<p class="docs-intro">Creates a tab seperated layout, where multiple content panels are displayed in the same space with a intuitive navigation</p>

##Usage

- To apply the tab component add the `rb-tab` class and attribute `data-module="tab"` to a container element.

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
{{#with rb_tabs.default}}
{{> rb_tabs }}
{{/with}}
</div>


<h3 class="docs-example-title">Markup</h3>

```html
<div class="rb-tabs js-rb-live" data-module="tabs">
    <ul class="tabs-nav">
         <li class="tabs-nav-item">
             <button type="button" class="tabs-btn">Heading</button>
         </li>
        ...
    </ul>
    <div class="tabs-panel-wrapper">
        <div class="tabs-panel">
            <div class="tabs-content">
                content here!
            </div>
        </div>
        ...
    </div>
</div>
```

{{> docs_js_life }}

<hr>
##Panel animations
Panel animations can be applied by adding an modifier class to the component, for example `is-fade`.

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
{{#mergeJSON rb_tabs.default 'type: "is-fade js-rb-live"'}}
{{> rb_tabs }}
{{/mergeJSON}}
</div>


<h3 class="docs-example-title">Markup</h3>

```html
<div class="rb-tabs is-fade js-rb-live" data-module="tabs">
    ...
</div>
```

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
{{#mergeJSON rb_tabs.default 'type: "is-slide js-rb-live "'}}
{{> rb_tabs }}
{{/mergeJSON}}
</div>


<h3 class="docs-example-title">Markup</h3>

```html
<div class="rb-tabs is-slide js-rb-live" data-module="tabs">
    ...
</div>
```
