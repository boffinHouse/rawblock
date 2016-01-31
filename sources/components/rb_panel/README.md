#Panel
<p class="docs-intro">This component creates an panel, that through the use of an action, hides, shows or switches the appearance of contents.</p>

##Usage
The panel component consists of an panel element and action button:

- Add the `rb-panel` class, attribute `data-module="panel"` and an ID `id="your-unique-id"` to a panel container you want to activated.
- Add attributes `data-module="panelbutton"` and `aria-controls="your-unique-id"` to an button.


<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
    <div class="use-column-group use-gutters">
        {{#uniqueID}}
            <div class="use-size-50">
                <button class="rb-button is-primary js-rb-life" type="button" aria-controls="panel-{{id}}" data-module="panelbutton">Panel Button</button>
            </div>

            <div class="use-size-100">
                <div id="panel-{{id}}" class="rb-panel" data-module="panel">
                    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et</p>
                </div>
            </div>
        {{/uniqueID}}
    </div>
</div>

<h3 class="docs-example-title">Markup</h3>

```html
<!-- Panelbutton -->
<button class="YourButtonClass js-click" type="button" aria-controls="dummy-your-unique-id" data-module="panelbutton">Panel Button</button>

<!-- Panel -->
<div id="dummy-your-unique-id" class="rb-panel" data-module="panel">
    ...
</div>
```
                   
{{> docs_js_life }}
<hr>