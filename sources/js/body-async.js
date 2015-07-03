/*
//Handlebars
import Handlebars from '../../node_modules/handlebars/dist/handlebars.runtime';
import templates from './templates';
templates.call(window, Handlebars);
*/

var loadPackage = require('./libs/packageloader');
require('./polyfills/object-assign');
require('./libs/dom');
require('./libs/rb-life');
require('./modules/button');

//var Dialog = require('./modules/dialog');


loadPackage.basePath = 'js/';
loadPackage.modulePath = 'js/modules/';

//rbLife.init();





