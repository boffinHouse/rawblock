/*
//Handlebars
import Handlebars from '../../node_modules/handlebars/dist/handlebars.runtime';
import templates from './templates';
templates.call(window, Handlebars);
*/

var assign =  require('object.assign');
require('./libs/dom');
require('./libs/rb-life');

//var Dialog = require('./modules/dialog');
require('./modules/button');

if(!Object.assign){
	Object.assign = assign;
}




