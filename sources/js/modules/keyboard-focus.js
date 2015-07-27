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
		isKeyboardBlocked = true;
		clearTimeout(keyblockTimer);
		keyblockTimer = setTimeout(unblockKeyboardFocus, 66);
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

	root.addEventListener('focus', setKeyboardFocus, true);

	['mousedown', 'mouseup', 'touchstart', 'touchend'].forEach(function(eventName){
		document.addEventListener(eventName, removeKeyBoadFocus, true);
	});

	document.addEventListener('click', blockKeyboadFocus, true);

	window.addEventListener('focus', blockKeyboadFocus);
	document.addEventListener('focus', blockKeyboadFocus);

	if(dom){
		dom(document).addEventListener('rbscriptfocus', blockKeyboadFocus);
	}

})(window, document);
