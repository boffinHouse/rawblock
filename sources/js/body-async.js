/*
//Handlebars
import Handlebars from '../../node_modules/handlebars/dist/handlebars.runtime';
import templates from './templates';
templates.call(window, Handlebars);
*/

var loadPackage = require('./libs/packageloader');

require('./polyfills/object-assign');
//used by dom for dom.fn.animate
//window.BezierEasing = require('bezier-easing');
require('./libs/dom');

require('./libs/rb-utils');
require('./libs/rb-life');

loadPackage.basePath = 'js/';
loadPackage.modulePath = 'js/modules/';

/* either require modules or configure package loader */

//loadPackage.addPackage('moduleId', ['dependecy-source.js', 'source.js'])

require('./modules/button');


//rbLife.init();





