#RawBlock
The worlds most flexible and efficient responsive system to build maintainable modular HTML5 web interfaces.



##What is RawBlock
RawBlock gives you a way to build modular interfaces which are easy to maintain for future optimizations. It combines modern best practices, new technologies and solution to optimize the frontend development process.

###RawBlock is separated in 3 parts


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
- [rbinstall](https://github.com/boffinhouse/rawblock): Install RawBLock components to your project (grunt rbinstall --rbm=yourComponentName)

#####Server Tasks
- [Webserver with connect](https://github.com/gruntjs/grunt-contrib-connect): Start a static web server

#####CSS Tasks
- [Auto-Prefixer](https://github.com/nDmitry/grunt-autoprefixer): Parse CSS and add vendor-prefixed CSS properties using the Can I Use database.
- [SASS with libsass](https://github.com/sindresorhus/grunt-sass): Compile Sass to CSS using node-sass
- [Minify CSS](https://github.com/gruntjs/grunt-contrib-cssmin): Compress CSS files.

#####Image / SVG Tasks
- [Image minify](https://github.com/gruntjs/grunt-contrib-imagemin): Minify PNG and JPEG images.
- [SVG Minify](https://github.com/sindresorhus/grunt-svgmin): Minify SVG using SVGO
- [Merge SVG](https://github.com/FWeinb/grunt-svgstore): Merge SVGs from a folder.

#####Template Tasks
- [Assemble](https://github.com/assemble/assemble): Static template generator.
- [HTML Prettify](https://github.com/jonschlinkert/grunt-prettify): plugin for beautifying HTML

#####JavaScript Tasks
- [Browserify](https://github.com/substack/node-browserify): browserify will recursively analyze all the require() calls in your app in order to build a bundle you can serve up to the browser in a single <script> tag.
- [UglifyJS](https://github.com/gruntjs/grunt-contrib-uglify): Minify files with UglifyJS

#####Testing Tasks
- [HTML-Hint](https://github.com/yaniswang/grunt-htmlhint): Validate html files with htmlhint.
- [JS-Hint](https://github.com/gruntjs/grunt-contrib-jshint): Validate files with JSHint


