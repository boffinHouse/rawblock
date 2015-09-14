/*
//Handlebars
import Handlebars from '../../node_modules/handlebars/dist/handlebars.runtime';
import templates from './templates';
templates.call(window, Handlebars);
*/
var loadPackage = require('./libs/packageloader');

window.BezierEasing = require('bezier-easing');
//load dom or jQuery
require('./libs/dom');

require('./libs/rawblock');

/* configuration */
rb.isDebug = true;

if(!('ASSETBASEPATH' in window)){
	window.ASSETBASEPATH = '';
	rb.log('set ASSETBASEPATH to "". Please configure!');
}
loadPackage.basePath = window.ASSETBASEPATH + 'js/';
loadPackage.modulePath = window.ASSETBASEPATH + 'js/modules/';


/* define loading packages for non-crucial behaviors */
/* either require modules or configure package loader */
//loadPackage.addPackage('moduleId', ['dependecy-source.js', 'source.js'])


/* require crucial or small/often used behaviors directly */
require('./modules/button');

/* init after all modules are loaded or package loader is configured */
rb.life.init();





