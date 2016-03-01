#Button
<p class="docs-intro">Button component easily creates the most common buttons, which come in different styles.</p>

##Usage
Apply class `.rb-button` to a `<button>` or `<a>` element to create a button component.

- If you want to link to another page or place within a page, use the `<a>` element. Mainly JavaScript is not necessary.
- If you want to perform an action to carry out something, use the `<button>` element. JavaScript is mainly necssary

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
    <div class="u-column-group docs-gutters">
        <div class="u-size-auto">
            {{#mergeJSON rb_button 'title: "Home ", link:"#"'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
        <div class="u-size-auto">
            {{#mergeJSON rb_button 'title: "Start"'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
    </div>
</div>

<h3 class="docs-example-title">Markup Example</h3>

```html
<!-- Anchor (link) -->
<a href="index.html" class="rb-button">Home</a>

<!-- Button (action) -->
<button type="button" class="rb-button">Start</button>
```

<hr>

##Color modifier classes
These classes gives the buttons additional meaning.

<h3 class="docs-example-title">Modifier Classes</h3>

| Class name | Description
| ------------- |-------------|
| `.is-primary` | Indicates primary action  |
| `.is-secondary`| Indicates secondary action  |
|`.is-success`| Indicates succesfull or positive action  |
| `.is-danger` | Indicates dangerous or negative action  |
| `.is-warning` | Indicates warning or informative action  |
| `.is-disabled`| Additional class thats indicate action is disabled. |


<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
    <div class="u-column-group docs-gutters">
        <h4 class="docs-demo-title">Anchor button (Link)</h4>
        <div class="u-size-auto">
            {{#mergeJSON rb_button 'type: "is-primary", title: "Primary", link:"#"'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
        <div class="u-size-auto">
            {{#mergeJSON rb_button 'type: "is-secondary", title: "Secondary", link:"#"'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
        <div class="u-size-auto">
            {{#mergeJSON rb_button 'type: "is-success", title: "Success", link:"#"'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
        <div class="u-size-auto">
            {{#mergeJSON rb_button 'type: "is-danger", title: "Danger", link:"#"'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
        <div class="u-size-auto">
            {{#mergeJSON rb_button 'type: "is-warning", title: "Warning", link:"#"'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
    </div>
    <div class="u-column-group docs-gutters">
        <h4 class="docs-demo-title">Action button</h4>
        <div class="u-size-auto">
            {{#mergeJSON rb_button 'type: "is-primary", title: "Primary"'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
        <div class="u-size-auto">
            {{#mergeJSON rb_button 'type: "is-secondary", title: "Secondary "'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
        <div class="u-size-auto">
            {{#mergeJSON rb_button 'type: "is-success", title: "Success"'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
        <div class="u-size-auto">
            {{#mergeJSON rb_button 'type: "is-danger", title: "Danger"'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
        <div class="u-size-auto">
            {{#mergeJSON rb_button 'type: "is-warning", title: "Warning"'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
    </div>
    <div class="u-column-group docs-gutters">
        <h4 class="docs-demo-title">Disabled</h4>
        <div class="u-size-auto">
            {{#mergeJSON rb_button 'title: "Disabled anchor", disabled: true, link:"#"'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
        <div class="u-size-auto">
            {{#mergeJSON rb_button 'title: "Disabled button", disabled: true'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
    </div>
</div>


<h3 class="docs-example-title">Markup Example</h3>

```html
<!-- Anchor (link) -->
<a href="index.html" class="rb-button is-primary">
    Primary Anchor Button
</a>

<!-- Disabled Anchor (link) -->
<a href="index.html" class="rb-button is-primary" aria-disabled="true" tabindex="-1">
    Disabled Anchor
</a>

<!-- Button (action) -->
<button type="button" class="rb-button is-primary">
    Primary Action Button
</button>

<!-- Disable Button (action) -->
<button type="button" class="rb-button is-primary is-disabled" disabled="disabled">
    Disabled Button
</button>
```
<hr>

##Additional classes
These classes changes the shape of a button.

<h3 class="docs-example-title">Modifier Classes</h3>

| Class name | Description
| ------------- |-------------|
| `.is-stretched`| Additional class take up 100% of the width of their parent container.


<h3 class="docs-example-title">Demo</h3>

<div class="docs-example">
    <div class="u-column-group docs-gutters">
        <div class="u-size-50">
            {{#mergeJSON rb_button 'type: "is-primary is-stretched", title: "Primary"'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
        <div class="u-size-50">
            {{#mergeJSON rb_button 'type: "is-secondary is-stretched", title: "Secondary "'}}
                {{> rb_button }}
            {{/mergeJSON}}
        </div>
    </div>
</div>