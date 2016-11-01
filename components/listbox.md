#Listbox
<p class="docs-intro">The listbox component turns a list into selectable list, individually or grouped.</p>

##Usage
To apply the itemscroller component add class `rb-listbox` and attribute `data-module="listbox"` to a container element.

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
    {{#with listbox.default }}
        {{> listbox }}
    {{/with}}
</div>

<h3 class="docs-example-title">Markup</h3>

```html
<ul class="rb-listbox js-rb-live" data-module="listbox">
    <li class="listbox-item">...</li>
</ul>
```

{{> docs_js_life }}

<hr>
