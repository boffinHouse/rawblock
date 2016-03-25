#Sass Coding Convention
The purpose of RawBlock Sass Conventions is that every line of code should appear to be written by a single person, no matter how many contributors. It helps teams improve the readability of code and makes sass maintainance easier. 

##General Principles
The general principles is not the style globally, but in reusable components and patterns.

- All code should look a like a single person has made it.
- Keep your code readable, balanced and understandable. 
- Keep code scalable.
- Write component wise and not context aware.

##Naming Convention

###Single Hyphen Delimited
All strings in classes are delimeited with a hyphen (-).

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

1. Box model
2. Positioning
3. Typographic
4. Visual

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
- Don't mix spaces with tabs for indentation
- Improve readability by using white-space

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

**The use of a hyphen `-` in the component name is explicitly forbidden**. The prefix or the alphanumeric basename gives everyone a good indication where each component starts.

Use class names that are as short as possible, but as long as necessary.

> **Good**

	//With RawBlock prefix
	.rb-infobox {
		...
	}
	
	.infobox {
		...
	}
	
	rb-mainnav {
	
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
	rb-mainnavigation {
	
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



