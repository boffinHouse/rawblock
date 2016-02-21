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

Element classes are always unique and should be declared not in context of the component name as long as this is not needed for modifier class

Good examples
- the image of the logo component: `.logo-img`
- a input box in the search form: `.search-box.is-focused`
- an item in main nav: `.rb-mainnav.is-fixed .mainnav-item`

The SASS `@at-root` directive can be of good help here:

```scss

.rb-mainnav {

    @at-root .mainnav- {
        &item {

        }

        .rb-mainnav.is-fixed &item {

        }

        &link {

        }
    }
}
```

####Modifiers/States
Modifiers are flags set on **block** or **element** elements, they represent a different state or version. This is done with the modifier class, like `.is-collapsed` or `is-offset-left`.
Modifier classes are only allowed as adjoining classes.

