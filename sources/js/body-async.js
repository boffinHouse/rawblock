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

//var Dialog = require('./modules/dialog');
//require('./modules/button');


loadPackage.basePath = 'js/';
loadPackage.modulePath = 'js/modules/';

rbLife.init();





