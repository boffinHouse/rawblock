var bind = require("function-bind");
var assign = require('object-assign');

require('dom4');
require('es6-promise');

require('array.from').shim();
require('array.prototype.find').shim();

require('string.prototype.endswith');
require('string.prototype.includes');
require('string.prototype.repeat');
require('string.prototype.startswith');

//require('whatwg-fetch');

//require('lazysizes/plugins/respimg/ls.respimg');

if(!Function.prototype.bind){
	Function.prototype.bind = bind;
}

if(!Object.assign){
	Object.assign = assign;
}
