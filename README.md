#RawBlock
The worlds most flexible and efficient responsive component library to build modular HTML5 web interfaces.


##Requirements
RawBlock relies on some tools who must be globally installed on your machine.  

- [NodeJS](https://nodejs.org/en/). Works with version 0.12 and higher!
- [Grunt](http://gruntjs.com/getting-started) is used as our task runner to build the project.
- [SASS](http://sass-lang.com/) as our CSS preprocessor.

##Setup
- Download RawBlock

##Building

Grunt build tasks

- `grunt`: **default task** 
	- Development directory `dev` is created.
	- deletes previously `dev` build, 
	- rebuilds templates (assemble, prettify html), 
	- rebuilds css (compiles sass to css, prefixes css), 
	- rebuilds JS (compiles ). Development directory `dev` is build.
- `grunt dist`: **default task** (deletes previously build, rebuilds templates (markup), rebuilds css (compiles sass to css, prefixes css, minifies the css). 

##Todo

##LICENSE
RawBlock is licensed under the MIT Open Source license. For more information, see the [LICENSE](https://github.com/boffinHouse/rawblock/blob/gh-pages/LICENSE) file in this repository.
