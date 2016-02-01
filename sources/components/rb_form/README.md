#Form
<p class="docs-intro">The forms component allows you to easily create forms that provide customized form elements and validation.</p>

##Usage
To apply this component:
- Add class `rb-form` to the form element. If validation is needed add also attribute `data-module="validation"` and class `js-rb-life`.
- Form element are nested inside container `form-field` and a corresponding modifier class is added to the container. For example when you use element `<select>` you
add class `is-select` the container `form-field`.

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
    <form action="#" class="rb-form">
        <fieldset  class="form-section">
            <legend class="form-section-legend">Legend title</legend>
            {{#mergeJSON rb_form.input 'label: "input"'}}
                {{> rb_input}}
            {{/mergeJSON}}
            
            {{#mergeJSON rb_form.select 'label: "select"'}}
                {{> rb_input}}
            {{/mergeJSON}}
            
            {{#mergeJSON rb_form.checkbox 'label: "Checkbox"'}}
                {{> rb_input}}
            {{/mergeJSON}}

            {{#mergeJSON rb_form.radio 'label: "Radio"'}}
                {{> rb_input}}
            {{/mergeJSON}}

            <button class="rb-button is-primary">Submit</button>
        </fieldset>
    </form>
</div>


<h3 class="docs-example-title">Markup</h3>

```html
<form action="#" class="rb-form">
    <fieldset class="form-section">
        <legend class="form-section-legend">...</legend>
        <div class="form-field is-text">
            <label>...</label>
            <input type="text">
        </div>
        <div class="form-field is-select">
            <label>...</label>
            <select>...</select>
        </div>
        <div class="form-field is-checkbox">
            <label>
                <input type="checkbox">
                <span class="label">...</span>
            </label>
        </div>
        <div class="form-field is-radio">
            <label>
                <input type="radio">
                <span class="label">...</span>
            </label>
        </div>
       <button class="rb-button is-primary">...</button>
    </fieldset>
</form>
```
<hr>

##Form layout
The form layout can be structured with form classes to create sections `form-section` and `form-subsection`,
rows `form-row`, boxes `form-box` and fields `form-fields`.

TIP: You can apply utility classes `use-column-group`, `use-gutters` and `use-size-*` to create your layout widths and space.

<h3 class="docs-example-title">Classes</h3>

| Class name | Description
| ------------- |-------------|
| `.form-section` | Use for main form section (first `fieldset`).|
| `.form-section-legend` | Use for main title (`legend`) form. |
| `.form-subsection`| Use to divide form in multiple division. |
| `.form-subsection-legend`| Use for titles in sub sections. |
|`.form-intro`| Use for introduction text. |
| `.form-row` | Use on parent container for boxes `form-box` to group them. Utility class `use-colum-group` and `use-gutter` can be used to set box inline and space.|
| `.form-box` | Use as column box to divide elements. Utility class `use-size-*` can be used to set width. |
| `.form-field`| Use as container to group form elements (`<input>`, `<select>`, `<textarea>`) and `<label>`  |


<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
    <form action="#" class="rb-form">
        <fieldset class="form-section">
            <legend class="form-section-legend">Section 1</legend>
            <p class="form-intro">Intro text</p>
            <fieldset class="form-subsection">
                <legend class="form-subsection-legend">Section 2</legend>
                <p class="form-intro">Intro text 2</p>
                <div class="form-row use-column-group use-gutters">
                    <div class="form-box use-size-50">
                        <div class="form-field">
                            {{#mergeJSON rb_form.input 'label: "Text field"'}}
                                {{> rb_input}}
                            {{/mergeJSON}}
                        </div>
                    </div>
                    <div class="form-box use-size-50">
                        <div class="form-field">
                            {{#mergeJSON rb_form.input 'label: "Text field"'}}
                                {{> rb_input}}
                            {{/mergeJSON}}
                        </div>
                    </div>
                </div>
            </fieldset>
        </fieldset>
    </form>
</div>


<h3 class="docs-example-title">Markup</h3>

```html
<form action="#" class="rb-form">
    <fieldset class="form-section">
        <legend class="form-section-legend">...</legend>
        <p class="form-intro">...</p>
        <fieldset class="form-subsection">
            <legend class="form-subsection-legend">...</legend>
            <p class="form-intro">...</p>
            <div class="form-row">
                <div class="form-box">
                    <div class="form-field">...</div>
                </div>
                ...
            </div>
        </fieldset>
    </fieldset>
</form>
```
<hr>

##Grouping

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
    <form action="#" class="rb-form">
        {{#mergeJSON 'label: "Grouped Inputs", classNames: "js-validation-group"'}}
        {{> rb_grouped_begin}}
        <div class="form-row use-column-group use-gutters">
            <div class="form-box use-size-50">
                {{#mergeJSON 'label: "Default group input 50",  booleans: ["required"]'}}
                    {{> rb_input}}
                {{/mergeJSON}}
            </div>
            <div class="form-box use-size-50">
                {{#mergeJSON  'label: "Default group input 50",  booleans: ["required"]'}}
                    {{> rb_input}}
                {{/mergeJSON}}
            </div>
        </div>        
        {{> rb_grouped_end}}
        {{/mergeJSON}}
    </form>        
</div>        


<h3 class="docs-example-title">Markup</h3>

```html
<form action="#" class="rb-form">
    <fieldset class="form-section">
        <legend class="form-section-legend">...</legend>
        <p class="form-intro">...</p>
        <fieldset class="form-subsection">
            <legend class="form-subsection-legend">...</legend>
            <p class="form-intro">...</p>
            <div class="form-row">
                <div class="form-box">
                    <div class="form-field">...</div>
                </div>
                ...
            </div>
        </fieldset>
    </fieldset>
</form>
```
<hr>