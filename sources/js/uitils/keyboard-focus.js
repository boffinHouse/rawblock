(function(window, document){
	'use strict';
	var keyboardBlocktimer;
	var isKeyboardBlocked = false;
	var root = document.documentElement;
	var dom = window.jQuery || window.dom;

	var unblockKeyboardFocus = function(){
		isKeyboardBlocked = false;
	};
	var blockKeyboadFocus = function(){
		isKeyboardBlocked = true;
		clearTimeout(keyboardBlocktimer);
		keyboardBlocktimer = setTimeout(unblockKeyboardFocus, 66);
	};
	var removeKeyBoadFocus = function(){
		root.classList.remove('is-keyboardfocus');
		blockKeyboadFocus();
	};
	var setKeyboardFocus = function(){
		if(!isKeyboardBlocked){
			root.classList.add('is-keyboardfocus');
		}
	};
	var pointerEvents = (window.PointerEvent) ?
		['pointerdown', 'pointerup'] :
		['mousedown', 'mouseup', 'touchstart', 'touchend']
	;

	root.addEventListener('focus', setKeyboardFocus, true);

	pointerEvents.forEach(function(eventName){
		document.addEventListener(eventName, removeKeyBoadFocus, true);
	});

	document.addEventListener('click', blockKeyboadFocus, true);

	window.addEventListener('focus', blockKeyboadFocus);
	document.addEventListener('focus', blockKeyboadFocus);

	if(dom){
		dom(document).addEventListener('rbscriptfocus', blockKeyboadFocus);
	}

})(window, document);
