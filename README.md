#RawBlock
The worlds most flexible and efficient responsive system to build maintainable modular HTML5 web interfaces.



##What is RawBlock
RawBlock gives you a way to build modular interfaces which are easy to maintain for future optimizations. It combines modern best practices, new technologies and solution to optimize the frontend development process. 

###RawBlock is separatet in 3 parts


1. **RawBlock Web Starter Kit** <br>
To boost your project startup. Start your project with the Rawblock Starter Kit. 
2. **Grid Layout**<br>
We use flexible, multi-device and human readable syntax to setup the basis of your site. 
3. **Components**<br>
A key aspect of RawBlock is modularity. We archieve this by creating isolated components who are context unaware. 

##1. RawBlock Web Starterkit
It is often a hard and time consuming part to start a new project. To help you with this, we developed the **RawBlock Web Starterkit**. Which gives you a solid base with a selection of tools to help you with this process.

###One Time Setup Requirements
RawBlock Web Starterkit relies on [NodeJS](https://nodejs.org/), [NPM](https://www.npmjs.com/), [SASS](http://sass-lang.com/) and [Grunt](http://gruntjs.com/). These tools must be globally installed on your machine. If you finished with this, you can start using RawBlock Web Starterkit in your projects.


####Build Process Tasks
Node and NMP are used to run [Grunt](http://gruntjs.com/), the task runner. NPM will download the modules needed to perform certain tasks in Grunt. The tasks are stored in the `grunt_tasks` folder inside the `root` and loaded with [load-grunt-configs](https://github.com/creynders/load-grunt-configs/).
Which modules are included:

####General Tasks
- [Clean](https://github.com/gruntjs/grunt-contrib-clean): Clear files and folders.
- [Concurrent](https://github.com/sindresorhus/grunt-concurrent): Run grunt tasks concurrently
- [Concat](https://github.com/gruntjs/grunt-contrib-concat): Concatenate files.
- [Copy](https://github.com/gruntjs/grunt-contrib-copy): Copy files and folders
- [Watch](https://github.com/gruntjs/grunt-contrib-watch): Run tasks whenever watched files change.
- [Newer](https://github.com/tschaub/grunt-newer): Configure Grunt tasks to run with newer files only.
- [Sync](https://github.com/tomusdrw/grunt-sync): task providing one-way synchronization of directories. Instead of copying all files only those that has been changed are copied which actually results in much faster execution.
- [Just in Time(JIT)](https://github.com/shootaroo/jit-grunt): JIT(Just In Time) plugin loader for Grunt.
- [Time Execution](https://github.com/sindresorhus/time-grunt): Display the elapsed execution time of grunt tasks

#####Server Tasks
- [Webserver with connect](https://github.com/gruntjs/grunt-contrib-connect): Start a static web server
- [Browser Sync](https://github.com/BrowserSync/browser-sync): Keep multiple browsers & devices in sync when building websites.

#####CSS Tasks
- [Auto-Prefixer](https://github.com/nDmitry/grunt-autoprefixer): Parse CSS and add vendor-prefixed CSS properties using the Can I Use database.
- [SASS with libsass](https://github.com/sindresorhus/grunt-sass): Compile Sass to CSS using node-sass
- [Minify CSS](https://github.com/gruntjs/grunt-contrib-cssmin): Compress CSS files.
- [Combine Media Queries](https://github.com/frontendfriends/grunt-combine-mq): Combine matching media queries into one media query definition.

#####Image / Icon Tasks
- [Image minify](https://github.com/gruntjs/grunt-contrib-imagemin): Minify PNG and JPEG images.
- [SVG - CSS](https://github.com/psyrendust/grunt-svg-css): Convert a folder of SVG files into a single file using data-uri.
- [SVG Minify](https://github.com/sindresorhus/grunt-svgmin): Minify SVG using SVGO
- [Merge SVG](https://github.com/FWeinb/grunt-svgstore): Merge SVGs from a folder.


#####Template Tasks
- [Assemble](https://github.com/assemble/assemble): Static template generator.
- [HTML Prettify](https://github.com/jonschlinkert/grunt-prettify): plugin for beautifying HTML


#####JavaScript Tasks
- [UglifyJS](https://github.com/gruntjs/grunt-contrib-uglify): Minify files with UglifyJS

#####Testing Tasks
- [HTML-Hint](https://github.com/yaniswang/grunt-htmlhint): Validate html files with htmlhint.
- [JS-Hint](https://github.com/gruntjs/grunt-contrib-jshint): Validate files with JSHint
- [Pagespeed](https://github.com/jrcryer/grunt-pagespeed): Run Google PageSpeed Insights as part of CI
- [Accessibility Testing](https://github.com/yargalot/grunt-accessibility): Uses AccessSniff and HTML Codesniffer to grade your sites accessibility using different levels of the WCAG guidelines
- [Phantomas](https://github.com/stefanjudis/grunt-phantomas): Wrapping phantomas to measure frontend performance


####Maybe?
- [Photobox](https://github.com/stefanjudis/grunt-photobox): creating screenshots of any site and compare them.



##2. Layout Grid
RawBlock provides a layout grid system that is flexible, responsive and uses a human readable syntax. Our grid is


### Basic principles
The layout grid targeting several screen sizes. To accomplish this, we use percentages as our base units and @media queries to allow you to decide what width an element should take when viewed in a specific screen sizes.

Inside `sources/sass/variables/_layout.scss` you can find the variable `$breakpointConfig` where you can declare your breakpoints and give the specific breakpoint-class. To share styles in all screen sizes the property `all` must be used.

Example

	$breakpointConfigs: (
		all: (
			gutter: (
				vertical: 40px,
				horizontal: 40px
			)
		),
		l: (
			media:'(min-width: 1240px)'
		),
		m: (
			media:'(min-width: 569px) and (max-width: 1239px)'
		),
		s: (
			media: '(max-width: 568px)',
			gutter: (
				vertical: 20px,
				horizontal: 20px
			)
		)
	);


###Setup



##3. Component
The base of RawBlock is modularity. We archieve this by creating isolated components who are context unaware. Two methologies who have influences the setup of a component are [BEM](https://en.bem.info/method/) and [SMACSS](https://smacss.com/).


###Block
In RawBlock a **block** is the top-level abstraction of a object, that represent a piece of interface on a page. A block container get a CSS class of a prefix (in Rawblock this is `rb-`) and the block name (or component name). This prefix gives everyone a good indication where each component starts. A block is not an encapsulated module, but may contain other blocks.

- a main nav: `.rb-main-nav`
- a search: `.rb-search`
- a logo: `.rb-logo`

**HTML Example**

	<div class="rb-head">
		<div class="rb-logo">...</div>
		<form action="..." class="rb-search">...</div>
		<nav class="rb-main-nav">...</div>
	</div>

####Block Page

####Element
An element represents a descendent within the block. It should only make sense in the context of the block. An element starts with the block name, but without the prefix `rb-`. Important is that elements always are written in the scope of a block element. This means that an block always only hav one nested selector.

**Examples are:**

- An item inside b-main-nav: `rb-main-nav main-nav-item`
- An field inside b-search: `b-search search-field`

This is a different approach then the BEM syntax, where you only define one unique selector. The advantages of this is that you exactly know where a block starts and ends.


####Modifier
Modifiers are flags set on **block** or **element**, they represent a different state or version. This is done with the modifier class, like `.is-collapse` or `is-offset-left`.




