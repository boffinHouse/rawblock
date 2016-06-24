#Popover
<p class="docs-intro">This component is used to display contextual information. It can be a simple tooltip or used for more complex components, such as a preview panel.</p>

##Usage
The popover component consists of an popover panel element and button (`<button>` or `<a>`).

- Add the `rb-popover` class, attribute `data-module="popover"` and an ID `id="your-unique-id"` to a container element you want to control.
- Add attribute `data-module="panelbutton"` on a button or anchor element. If button element `<button>` add attributes `aria-controls="your-unique-id"` and if
anchor element `<a>` add the id to href attribute `href="#your-unique-id"`.

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
    {{#mergeJSON rb_popover 'btn: {type: "rb-button js-rb-click", title:"Default top"}'}}
        {{> rb_popover }}
    {{/mergeJSON}}
</div>

<h3 class="docs-example-title">Markup</h3>

```html
<!-- Panelbutton -->
<button class="YourButtonClass js-rb-click" type="button" aria-controls="your-popover-id" data-module="panelbutton">Panel Button</button>

<a class="YourButtonClass js-rb-click" href="#your-popover-id" data-module="panelbutton">Panel Anchor button</a>

<!-- Panel -->
<div id="your-popover-id" class="rb-popover" data-module="popover">
    <div class="popover-content">...</div>
</div>
```

{{> docs_js_life }}

<hr>

##Positions

<h3 class="docs-example-title">Demo</h3>

<table>
    <thead>
    <tr>
        <th>Class name</th>
        <th>Description</th>
        <th>Example</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td><code>.is-top</code></td>
        <td>Aligns popover to the top.</td>
        <td>
            {{#mergeJSON rb_popover 'btn: {title:"Top"}, panel: {type: "is-top"}'}}
                {{> rb_popover }}
            {{/mergeJSON}}
        </td>
    </tr>
    <tr>
        <td><code>.is-top-right</code></td>
        <td>Aligns popover to the top right.</td>
        <td>

        </td>
    </tr>
    <tr>
        <td><code>.is-top-left</code></td>
        <td>Aligns popover to the top left.</td>
        <td>

        </td>
    </tr>
    <tr>
        <td><code>.is-bottom</code></td>
        <td>Aligns popover to the bottom.</td>
        <td>
            {{#mergeJSON rb_popover 'btn: {title:"Bottom"}, panel: {type: "is-bottom"}'}}
                {{> rb_popover }}
            {{/mergeJSON}}
        </td>
    </tr>
    <tr>
        <td><code>.is-bottom-right</code></td>
        <td>Aligns popover to the bottom right.</td>
        <td>

        </td>
    </tr>
    <tr>
        <td><code>.is-bottom-left</code></td>
        <td>Aligns popover to the bottom left.</td>
        <td>

        </td>
    </tr>
    <tr>
        <td><code>.is-right</code></td>
        <td>Aligns popover to the right.</td>
        <td>
            {{#mergeJSON rb_popover 'btn: {title:"Right"}, panel: {type: "is-right"}'}}
                {{> rb_popover }}
            {{/mergeJSON}}
        </td>
    </tr>
    <tr>
        <td><code>.is-left</code></td>
        <td>Aligns popover to the left.</td>
        <td>
            {{#mergeJSON rb_popover 'btn: {title:"Left"}, panel: {type: "is-left"}'}}
                {{> rb_popover }}
            {{/mergeJSON}}
        </td>
    </tr>
    </tbody>
</table>


