#RawBlock
The worlds most flexible and efficient responsive component library to build modular HTML5 web interfaces.

##Requirements
RawBlock relies on some tools who must be globally installed on your machine.  

- [NodeJS](https://nodejs.org/en/). Works with version 6.9.x and higher!
- [Grunt](http://gruntjs.com/getting-started) is used as our task runner to build the project.
- [SASS](http://sass-lang.com/) as our CSS preprocessor.

##Getting Started
This is what you have to do to start a project with RawBlock.

- Download the [latest](https://github.com/boffinHouse/rawblock/archive/gh-pages.zip) version.

##Building

Grunt build tasks:

- `grunt`: Deletes previously `dev` build, rebuilds templates (assemble, prettify html), rebuilds css (compiles sass to css, prefixes css), rebuilds JS (compiles ). Use in development phase.
- `grunt dist`: Deletes previously `dist` build, rebuilds templates (assemble, prettify html), rebuilds css (compiles sass to css, prefixes css, minifies the css), rebuilds JS (compiles ). Use for distribution. 


##LICENSE
RawBlock is licensed under the MIT Open Source license. For more information, see the [LICENSE](https://github.com/boffinHouse/rawblock/blob/gh-pages/LICENSE) file in this repository.
