#Sass Coding Convention
The purpose of RawBlock Sass Conventions is that every line of code should appear to be written by a single person, no matter how many contributors. It helps teams improve the readability of code and makes sass maintainance easier.

##General Principles
The general principles is not to the style globally, but in reusable components and patterns.

- All code should look a like a single person has made it.
- Keep your code readable, balanced and understandable.
- Keep code scalable.
- Write component wise and not context aware.

##Naming Convention

###Single Hyphen Delimited
All strings in classes are delimited with a hyphen (-).

> Good

	.rb-mainarticle { }

	.rb-breadcrumbs { }

> Bad: camelCase, double hyphen and underscore can't be used for classes.

	.mainArticle { }

	.mainarticle--head { }

	.item_group { }


###Naming Variables

###Naming Breakpoints


##CSS Rule Sets

##Declarartion order
Related property declarations should be grouped together following the order:

1. @extend
1. @include
1. Box model
1. Positioning
1. Typographic
1. Visual

For a complete list of properties and their order, see [RawBlock's CSS combination](https://github.com/boffinHouse/rawblock/blob/gh-pages/taskrunner/task-settings/.rawblock-csscomb.json).

##Commenting

##Formating

###Quotes
Always use double quotes if possible.

> Good

	.listbox-link[href=".pdf"] {
		content: "";
		font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
		background-image: url("../img/your.svg");
	}

> Bad

	.listbox-link[href=.pdf] {
		content: '';
		font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
		background-image: url(../img/your.svg);
	}

###Indentation
- Use a soft-tab of 4 spaces.
- Don't mix spaces with tabs for indentation.
- Improve readability by using white-space.

###Spacing
- CSS rules should be comma separated but live on new lines.
- Include a single space before the opening brace of a rule-set
- Include a single space after the colon of a declaration.
- Include a semi-colon at the end of every declaration in a declaration block.
- Include a space after each comma in comma-separated property or function values.
- Place the closing brace of a rule-set on its own line.
- CSS blocks should be separated by a single clear line.

> Good

	.rb-yourcomponent {
		display: block;
		width: 100%;
	}

	.yourcomponent-link {
		...
	}

	.yourcomponent-text {
		...
	}


###Preprocessors: additional format considerations

##Components
The base of RawBlock is modularity. This is archieved by creating isolated components who are context unaware. While rawblock's naming convention gives the same grade of isolation/ re-usage of components compared to BEM it leads to much shorter class names.

You can think of components as custom elements that enclose specific semantics, styling, and behaviour.


The main architectuaral seperation in RawBlock are between components and utilities:

- componentname (eg. `.rb-mainnav` or `.rb-breadcrumbs`).
- componentname-descendantname (eg. `.mainnav-item` or `.breadcrumbs-list`).
- componentname-modifiername (eg. `rb-mainnav.is-special` or `.breadcrumbs-list.is-open`)


> **Syntax:** `[<namespace>-]<componentname>[.is-modifiername | -descendantname]`

###componentname (block)
In RawBlock a **block** is the top-level abstraction of an object, that represent a piece of interface on a page. A block container gets a class name, that is composed by an optional namespace (in Rawblock this is `rb-`) and an alphanumeric component name.

**The use of a hyphen `-` in the component name is explicitly forbidden**. The prefix or the alphanumeric basename without a hyphen gives everyone a good indication where each component starts.

Use class names that are as short as possible, but as long as necessary.

> **Good**

	//With RawBlock prefix
	.rb-infobox {
		...
	}

	.infobox {
		...
	}

	.rb-mainnav {

	}

> **Bad**

	//Dont use hyphen in component name
	.rb-info-box {
		...
	}

	.info-box {
		...
	}

	//To Long
	.rb-mainnavigation {

	}


###componentname-descendantname (element)
An element represents a descendant within the block. It should only make sense in the context of the block. The class name of the descendant element is composed with the component name **(without the prefix)** and the actual descendant name.

The descendant name can have any W3C allowed class name characters. For brevity the child of a descendant element should not repeat the descendant name, but only the component name as its prefix.

Element classes are always unique and should be declared not in context of the component name as long as this is not needed for modifier class.

> **Good**

	.infobox-item {
		...
	}

	.mainnav-group {
		...
	}

> **Bad**

	.rb-infobox-item {
		...
	}

	.info-box-item {
		...
	}

	.rb-infobox {
		...

		.infobox-item {
		 ...
		}
	}


###componentname-modifiername (versions or states)
Modifiers are flags set on **block** or **element** elements, they represent a different state or version. This is done with the modifier class, like `.is-collapsed` or `is-offset-left`. Modifier classes are only allowed as adjoining classes.

###Separation of behavior and style
A common technique to produce re-usable JS components is to use two different selectors one for styling and the other for behavior (often either prefixed with `js-*` or by using slower attribute selectors).

This technique allows to generate multiple style components which use the exact same JS code.

While rawblock supports the js-prefix technique automatically (Simply set the `jsPrefix` option to `'js-'`), rawblock advocates a different approach.

The two-selector technique does not only separate two different concerns, it also separates the crucial functional design from the actual behavior.

Rawblock instead allows CSS developer to configure the component name by HTML or CSS. This way CSS extends the naming of the hole component and avoids clashes with JS.

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
        name: heroscroller,
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

However sometimes you might want to opt-in to the `js-` prefix selector technique, because this technique also signalizes other developers, that this class name has a dependency to JS and any change to it also need a JS change.

In this case you should also use the JS prefixed class name in your styles. As explained above you only need the prefix to signalize a JS dependency, but you don't need to separate the technologies.

```html
<style type="scss">
//main setting for all components
//set jsPrefix to "js-".
@include rb-export-globaljs((
    mqs: $breakpoint-config,
    jsPrefix: "js-",
));
</style>
<style type="scss">
.rb-heroscroller {
    @include rb-js-export((
        //will be automatically prefixed with jsPrefix.
        name: heroscroller,
    ));
    //some styles
}

//class shared between CSS and JS
.js-heroscroller-btn-next {
    //some styles
}

//element with no dependency to JS
.heroscroller-element {
    //some styles
}
</style>

<div class="rb-heroscroller js-rb-life" data-module="itemscroller">
    <!-- ... -->
    <div class="heroscroller-element"></div>
    <button type="button" class="js-heroscroller-btn-next">close</button>
</div>
```

##Commenting
TODO add short intro

	/*
 	* Component: Yourcomponentname
	**********************************************************/


	// Variables
	//**********************************************************
	$yourcomponentname-variable: ...;


	// JS Config
	//**********************************************************
	${yourcomponentname}-js-cfg: (
	    name: "{name}",
	);


	// Dependencies (Helpers)
	//**********************************************************
	@import '../../sass/helpers/you-are-using';

	//----------------------------------------------------------


