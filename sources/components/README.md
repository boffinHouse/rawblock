#Components
The base of RawBlock is modularity. We achieve this by creating isolated components who are context unaware.
While rawblock's naming convention gives the same grade of isolation/ re-usage of components compared to BEM it leads to much shorter class names.

###Block/Component name
In RawBlock a **block** is the top-level abstraction of an object, that represent a piece of interface on a page. A block container gets a class name, that is composed by an optional namespace (in Rawblock this is `rb-`) and an alphanumeric component name. The use of a `-` in the component name is explicitly forbidden. The prefix or the alphanumeric basename gives everyone a good indication where each component starts.

Good examples
- a main nav: `.rb-mainnav`
- a search: `.rb-search`
- a logo: `.rb-logo`

**HTML Example**

	<div class="rb-header">
		<div class="rb-logo">...</div>
		<form action="..." class="rb-search">...</div>
		<nav class="rb-mainnav">...</div>
	</div>

Bad examples:
- a main nav: `.rb-main-nav`
- a main nav: `.main-nav`

###Element
An element represents a descendant within the block. It should only make sense in the context of the block. The class name of the descendant element is composed with the component name (without the prefix) and the actual descendant name.

The descendant name can have any W3C allowed class name characters. For brevity the child of a descendant element should not repeat the descendant name, but only the component name as its prefix.

Element classes are always unique and should be declared not in context of the component name as long as this is not needed for modifier class.

Good examples
- the image of the logo component: `.logo-img`
- a input box in the search form: `.searchbox-input`
- an item in main nav: `.rb-mainnav.is-fixed .mainnav-item`


```scss

.rb-mainnav {
    ...
}

.mainnav-item {
    ...
    
    .rb-mainnav.is-fixed & {
        ...
    }
}

.main-link {
    ...
}

```

####Modifiers/States
Modifiers are flags set on **block** or **element** elements, they represent a different state or version. This is done with the modifier class, like `.is-collapsed` or `is-offset-left`.
Modifier classes are only allowed as adjoining classes.

####Separation of behavior and style
A common technique to produce re-usable JS components is to use two different selectors one for styling and the other for behavior (often either prefixed with `js-*` or by using much slower attribute selectors).

While rawblock JS supports the js-prefix technique automatically (Simply set the `jsPrefix` option to `'js-'`), rawblock advocates a different approach.

The two-selector technique does not only separate two different concerns, it also separates the crucial functional design from the actual behavior.

Rawblock instead allows to CSS developer to configure the component name by CSS. This way CSS extends the naming of the hole component and avoids clashes in JS.

This can be expressed with the following code:

```html
<!-- default itemscroller component -->
<style type="scss">
.rb-itemscoller {
    //some styles
}

.itemscoller-btn-next {
    //some styles
}
</style>

<div class="rb-itemscoller js-rb-life" data-module="itemscroller">
    <!-- ... -->
    <button type="button" class="itemscoller-btn-next">close</button>
</div>

<!-- new CSS component (heroscroller) re-uses untouched itemscroller JS component -->
<style type="scss">
.rb-heroscroller {

    @include rb-js-export((
        name: "heroscroller",
        carousel: true,
        centerMode: true,
    ));

    //some other styles
}

.heroscroller-btn-next {
    //some other styles
}
</style>

<div class="rb-heroscroller js-rb-life" data-module="itemscroller">
    <!-- ... -->
    <button type="button" class="heroscroller-btn-next">close</button>
</div>
```

