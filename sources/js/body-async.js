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

require('./uitils/simple-slide-updown');
//require('./uitils/focus-within');
//require('./uitils/keyboard-focus');


require('./modules/button');

loadPackage.basePath = 'js/';
loadPackage.modulePath = 'js/modules/';

//rbLife.init();





