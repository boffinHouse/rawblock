#Dialog
<p class="docs-intro">The dialog component creates a modal dialog to display additional content.</p>

##Usage
The component consists of a dialog element, close button and action button.

- To create an dialog add the `rb-dialog` class and attribute `data-module="dialog"` to a container element
- Add class `dialog-close` to a button inside `rb-dialog` to create a close button.
- Add attributes `data-module="button"`, `data-target="yourtarget"` and class `js-click` to create an open button.


<h3 class="docs-example-title">Demo</h3>

<div class="docs-example">
    <button class="rb-button js-click" type="button" data-module="button"  data-target="$(.rb-dialog)">open dialog</button>
    {{#with rb_dialog.default }}
        {{> rb_dialog }}
    {{/with}}
</div>


<h3 class="docs-example-title">Markup</h3>

```html
<!-- Open Button -->
<button class="js-click" type="button" data-module="button" data-target="$(.rb-dialog)"></button>

<!-- Modal Dialog -->
<div class="rb-dialog js-rb-life" data-module="dialog">
    <div class="dialog-content">
        ...
    </div>
    <button class="dialog-close">Close Dialog</button>
</div>
```

{{> docs_js_life }}
<hr>

##JavaScript Options
Here you find the most important options settings for this component. The full list of options can be found in the JavaScript documentation.

<h3 class="docs-example-title">Options</h3>

| Option | Value | Default | Description
| ------------- |------------- | ------------- |-------------|
| `open`  | Boolean | false | Whether the dialog should be open by default.

<hr>