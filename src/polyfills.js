import 'dom4';
import 'url-polyfill';
import 'string.prototype.startswith';
import 'string.prototype.repeat';
import 'string.prototype.includes';
import 'es6-promise';
import 'string.prototype.endswith';
import bind from 'function-bind';
import assign from 'object-assign';
import findIndex from 'array.prototype.findindex';
import entries from 'object.entries';
import values from 'object.values';
import arrayFrom from 'array.from';
import arrayFind from 'array.prototype.find';
import arrayIncludes from 'array-includes';

arrayFrom.shim();
arrayFind.shim();
arrayIncludes.shim();

if(!Function.prototype.bind){
	Function.prototype.bind = bind;
}

if(!Object.assign){
    Object.assign = assign;
}

if (!Object.entries) {
    entries.shim();
}

if (!Object.values) {
    values.shim();
}

if(!Array.prototype.findIndex){
    findIndex.shim();
}

if(!('scrollingElement' in document)){
    const root = document.documentElement;

    Object.defineProperty(document, 'scrollingElement', {
        get: ((document.compatMode == 'BackCompat' || 'WebkitAppearance' in root.style) ?
            function(){
                return  document.body || root;
            } :
            function(){
                return root;
            }),
        enumerable: true,
        configurable: true,
    });
}
