var bind = require("function-bind");
var assign = require('object-assign');
var findIndex = require('array.prototype.findindex');

require('dom4');
require('es6-promise');

require('array.from').shim();
require('array.prototype.find').shim();
require('array-includes').shim();

require('string.prototype.endswith');
require('string.prototype.includes');
require('string.prototype.repeat');
require('string.prototype.startswith');

if(!Function.prototype.bind){
	Function.prototype.bind = bind;
}

if(!Object.assign){
	Object.assign = assign;
}

if(!Array.prototype.findIndex){
    findIndex.shim();
}
