/*
//Handlebars
import Handlebars from '../../node_modules/handlebars/dist/handlebars.runtime';
import templates from './templates';
templates.call(window, Handlebars);
*/

var loadPackage = require('./libs/packageloader');
//used by dom for dom.fn.animate
//window.BezierEasing = require('bezier-easing');

require('./polyfills/object-assign');
require('./libs/dom');
require('./libs/rb-life');
require('./modules/button');
//require('./modules/focus-within');
//require('./modules/keyboard-focus');


loadPackage.basePath = 'js/';
loadPackage.modulePath = 'js/modules/';

//rbLife.init();





