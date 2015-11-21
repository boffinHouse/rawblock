/*
//Handlebars
import Handlebars from '../../node_modules/handlebars/dist/handlebars.runtime';
import templates from './templates';
templates.call(window, Handlebars);
*/
require('./libs/rb-plugins/rb_packageloader');

window.BezierEasing = require('bezier-easing');

//load dom or jQuery
require('./libs/dom');

require('./libs/rb-cssconfig');

require('./libs/rawblock');

/* configuration */
rb.isDebug = true;
//rb.life.customElements = true;

if(!('ASSETBASEPATH' in window)){
	window.ASSETBASEPATH = '';
	rb.log('set ASSETBASEPATH to "". Please configure!');
}

Object.assign(rb.packageConfig, {
	basePath: window.ASSETBASEPATH + 'js/',
	modulePath: window.ASSETBASEPATH + 'js/modules/rb_',
});


/* define loading packages for non-crucial behaviors */
/* either require modules or configure package loader */
//rb.registerPackage('moduleId/packageId', ['dependency-source.js', 'source.js'])


/* require crucial or small/often used behaviors directly */
//require('./modules/*');

/* init after all modules are loaded or package loader is configured */
rb.life.init();





