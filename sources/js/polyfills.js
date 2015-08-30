var AnimationFrame = require('animation-frame');
require('dom4');
require('es6-promise');
require('string.prototype.endswith');
require('string.prototype.includes');
require('string.prototype.repeat');
require('string.prototype.startswith');
require('whatwg-fetch');
//require('lazysizes/plugins/respimg/ls.respimg');


if(window.cancelAnimationFrame){
	AnimationFrame.shim();
}
