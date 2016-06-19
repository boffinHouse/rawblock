#Sticky
<p class="docs-intro">Creates a sticky element, that can be stuck to the top or the bottom of the viewport. Optionally can animate child elements after it has become stuck according to the scroll position.</p>

##Usage
To apply the sticky component:

- Add the `rb-sticky` class and attribute `data-module="sticky"` to an element you want to make sticky. Top is the default position.

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
    <div class="rb-sticky js-rb-live" data-module="sticky">
        <div class="docs-item" style="height: 40px;">
            Sticky to the top
        </div>
    </div>
</div>

<h3 class="docs-example-title">Markup</h3>

```html
<div class="rb-sticky js-rb-live" data-module="sticky">
...
</div>
```

{{> docs_js_life }}

<hr>

##Positioning
Positions can be handled using CSS. For example: To create an element that sticks to the bottom, you can create a modifier class `is-bottom` and add this class to the component container.

```css
.is-bottom {
    @include rb-js-export(map_merge($stickyJSCFG, (
        bottomOffset: 0,
        topOffset: false,
    )));
}
```

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example is-demo">
    <div class="rb-sticky js-rb-live is-bottom" data-module="sticky">
        <div class="docs-item" style="height: 40px;">
            Sticky to the bottom
        </div>
    </div>
</div>

Or if you want to offset the element 150px from the top. Create a class, in this example it's `.is-top-150` and add it to the container.

```css
.is-bottom {
    @include rb-js-export(map_merge($stickyJSCFG, (
        topOffset: 159,
        bottomOffset: false,
    )));
}
```

<h3 class="docs-example-title">Demo</h3>
<div class="demo-example">
    <div class="rb-sticky js-rb-live is-top-150" data-module="sticky">
        <div class="docs-item" style="height: 40px;">
            Sticky to the top with 150px offset.
        </div>
    </div>
</div>


<h3 class="docs-example-title">Markup</h3>

```html
<!-- sticky element to bottom -->
<div class="rb-sticky is-bottom js-rb-live" data-module="sticky">
...
</div>

<!-- sticky element to top offset 150px -->
<div class="rb-sticky is-top-150 js-rb-live" data-module="sticky">
...
</div>
```

<hr>

##Constraining in an area

<div class="is-sticky-container">
    <header  class="rb-header js-rb-live" data-module="sticky">
        <div class="docs-item" style="height: 40px;">
            Sticky to the top.
        </div>
    </header>
    <main>
        <div class="docs-item" style="height: 640px;">
            Main area
        </div>
    </main>
</div>
<footer>
    <div class="docs-item" style="height: 40px;">
        Footer
    </div>
</footer>


<div class="is-sticky-container">
    <header  class="rb-sticky js-rb-live" data-module="sticky">
        <div class="docs-item" style="height: 40px;">
            Sticky to the top.
        </div>
    </header>
    <main>
        <div class="docs-item" style="height: 440px;">
            Main area
        </div>
    </main>
</div>
<footer>
    <div class="docs-item" style="height: 40px;">
        Footer
    </div>
</footer>
