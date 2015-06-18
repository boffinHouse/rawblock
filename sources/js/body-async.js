/*
//Handlebars
import Handlebars from '../../node_modules/handlebars/dist/handlebars.runtime';
import templates from './templates';
templates.call(window, Handlebars);
*/

import assign from 'object.assign';
import './libs/dom';
import './libs/rb-life';

//import Dialog from './modules/dialog';
import './modules/button';

if(!Object.assign){
	Object.assign = assign;
}




