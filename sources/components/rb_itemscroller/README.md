#Itemscroller
<p class="docs-intro">The itemscroller component can be used as a responsive scroller with one or more items visible.</p>

##Usage
To apply the itemscroller component:

- Add the `rb-itemscroller` class and attribute `data-module="itemscroller"` to a container element.
- The component contains out of a viewport `itemscroller-viewport`, contentarea `itemscroller-content` and cells 'itemscroller-cells`.
- Use utility class 'u-size-*` to determine how many cells are visible by giving to cells a width.

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example is-demo">
    {{#mergeJSON rb_itemscroller.default }}
        {{> rb_itemscroller }}
    {{/mergeJSON}}
</div>

<h3 class="docs-example-title">Markup</h3>

```html
<div class="rb-itemscroller js-rb-live" data-module="itemscroller">
    <div class="itemscroller-viewport">
        <div class="itemscroller-content u-column-group">
            <div class="itemscroller-cell u-size-50">...</div>
        </div>
    </div>
</div>
```

{{> docs_js_life }}

<hr>

##Navigations
The component can be scrolled by mouse action (click and drag) or swipped on touch devices. Alternatively you can add more navigation
elements to navigate, like previous/next buttons or paginations.

<h3 class="docs-example-title">Classes</h3>

| Class name | Description
| ------------- |-------------|
| `.itemscroller-btn-prev` | Button to navigate to previous item or left. |
| `.itemscroller-btn-next`| Button to navigate to next item or right. |
| `.itemscroller-navigation` | List of pagination buttons to navigate to selected item |


<h3 class="docs-example-title">Demo with Mandatory Snap</h3>

<div class="docs-example">
    {{#mergeJSON rb_itemscroller.default 'pagination: true, attrs: {"data-itemscroller-mandatory-snap":true, "data-itemscroller-mandatory-snap-wheel":true}' }}
        {{> rb_itemscroller }}
    {{/mergeJSON}}
</div>

<h3 class="docs-example-title">Markup</h3>

```html
<div class="rb-itemscroller js-rb-live" data-module="itemscroller">
    <button type="button" class="itemscroller-btn-prev" tabindex="-1" aria-hidden="true">prev</button>
    <button type="button" class="itemscroller-btn-next" tabindex="-1" aria-hidden="true">next</button>
    <div class="itemscroller-viewport">

        <div class="itemscroller-content u-column-group">
            <div class="itemscroller-cell u-size-50">...</div>
        </div>
    </div>
    <div class="itemscroller-pagination"></div>
</div>
```

<hr>

##Center mode

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
	{{#mergeJSON rb_itemscroller.default 'pagination: true, attrs: {"data-itemscroller-center-mode":true}'}}
		{{> rb_itemscroller }}
	{{/mergeJSON}}
</div>

<h3 class="docs-example-title">Markup</h3>

```html
<div class="rb-itemscroller js-rb-live" data-module="itemscroller">
    <button type="button" class="itemscroller-btn-prev" tabindex="-1" aria-hidden="true">prev</button>
    <button type="button" class="itemscroller-btn-next" tabindex="-1" aria-hidden="true">next</button>
    <div class="itemscroller-viewport">

        <div class="itemscroller-content u-column-group">
            <div class="itemscroller-cell u-size-50">...</div>
        </div>
    </div>
    <div class="itemscroller-pagination"></div>
</div>
```

<hr>


##Carousel

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
    {{#mergeJSON rb_itemscroller.default 'attrs: {"data-itemscroller-carousel":true}'}}
        {{> rb_itemscroller }}
    {{/mergeJSON}}
</div>

<h3 class="docs-example-title">Markup</h3>

```html
<div class="rb-itemscroller js-rb-live" data-module="itemscroller">
    <button type="button" class="itemscroller-btn-prev" tabindex="-1" aria-hidden="true">prev</button>
    <button type="button" class="itemscroller-btn-next" tabindex="-1" aria-hidden="true">next</button>
    <div class="itemscroller-viewport">

        <div class="itemscroller-content u-column-group">
            <div class="itemscroller-cell u-size-50">...</div>
        </div>
    </div>
    <div class="itemscroller-pagination"></div>
</div>
```
<hr>


##Index

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
    {{#mergeJSON rb_itemscroller.default 'itemsIndex: true'}}
        {{> rb_itemscroller }}
    {{/mergeJSON}}
</div>

<h3 class="docs-example-title">Markup</h3>

```html
<div class="rb-itemscroller js-rb-live" data-module="itemscroller">
    <button type="button" class="itemscroller-btn-prev" tabindex="-1" aria-hidden="true">prev</button>
    <button type="button" class="itemscroller-btn-next" tabindex="-1" aria-hidden="true">next</button>
    <div class="itemscroller-viewport">

        <div class="itemscroller-content u-column-group">
            <div class="itemscroller-cell u-size-50">...</div>
        </div>
    </div>
    <div class="itemscroller-pagination"></div>
</div>
```
<hr>

##Pagination

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
    <div class="u-gutters-vertical">
        <div class="u-size-100">
            {{#mergeJSON rb_itemscroller.default 'attrs: {"id":"itemscroller-pagination"}'}}
                {{> rb_itemscroller }}
            {{/mergeJSON}}
        </div>
        <div class="u-size-100">
            {{#mergeJSON rb_itemscroller.default 'attrs: {"data-pagination-for":"itemscroller-pagination"}'}}
                {{> rb_itemscroller }}
            {{/mergeJSON}}
        </div>
    </div>
</div>

<h3 class="docs-example-title">Markup</h3>

