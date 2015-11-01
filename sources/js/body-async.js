/*
//Handlebars
import Handlebars from '../../node_modules/handlebars/dist/handlebars.runtime';
import templates from './templates';
templates.call(window, Handlebars);
*/
require('./libs/rb_packageloader');

window.BezierEasing = require('bezier-easing');

//load dom or jQuery
require('./libs/dom');

require('./libs/rawblock');

require('./libs/rb_queue');
require('./libs/rb_transform-hook');
require('./libs/rb_color-hook');

/* configuration */
rb.isDebug = true;
//rb.life.customElements = true;

if(!('ASSETBASEPATH' in window)){
	window.ASSETBASEPATH = '';
	rb.log('set ASSETBASEPATH to "". Please configure!');
}
rb.loadPackage.basePath = window.ASSETBASEPATH + 'js/';
rb.loadPackage.modulePath = window.ASSETBASEPATH + 'js/modules/';

//loadPackage.onlyKnown = true;


/* define loading packages for non-crucial behaviors */
/* either require modules or configure package loader */
//loadPackage.addPackage('moduleId/packageId', ['dependency-source.js', 'source.js'])


/* require crucial or small/often used behaviors directly */
//require('./modules/*');

/* init after all modules are loaded or package loader is configured */
rb.life.init();





