(function(window, document){
	'use strict';
	var keyblockTimer;
	var isKeyboardBlocked = false;
	var root = document.documentElement;
	var dom = window.jQuery || window.dom;

	var unblockKeyboardFocus = function(){
		isKeyboardBlocked = false;
	};
	var blockKeyboadFocus = function(){
		clearTimeout(keyblockTimer);
		isKeyboardBlocked = true;
		keyblockTimer = setTimeout(unblockKeyboardFocus, 99);
	};
	var removeKeyBoadFocus = function(){
		root.classList.remove('is-keyboardfocus');
		blockKeyboadFocus();
	};
	var setKeyboadFocus = function(){
		if(!isKeyboardBlocked){
			root.classList.add('is-keyboardfocus');
		}
	};

	root.addEventListener('focus', setKeyboadFocus, true);

	document.addEventListener('mousedown', removeKeyBoadFocus, true);
	document.addEventListener('mouseup', removeKeyBoadFocus, true);
	document.addEventListener('click', removeKeyBoadFocus, true);
	document.addEventListener('touchstart', removeKeyBoadFocus, true);
	document.addEventListener('touchend', removeKeyBoadFocus, true);

	window.addEventListener('focus', blockKeyboadFocus);
	document.addEventListener('focus', blockKeyboadFocus);
	dom(document).addEventListener('rbscriptfocus', blockKeyboadFocus);

})(window, document);
