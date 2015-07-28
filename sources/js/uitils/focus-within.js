(function(window, document){
	'use strict';

	var requestAnimationFrame = window.requestAnimationFrame || setTimeout;
	var running = false;

	function updateFocus(){
		var i, len;
		var focusParents = document.querySelectorAll('.is-focus-within');
		var parent = document.activeElement;

		for(i = 0, len = focusParents.length; i < len; i++){
			focusParents[i].classList.remove('is-focus-within');
		}

		while((parent = parent.parentNode) && parent.classList){
			parent.classList.add('is-focus-within');
		}

		running = false;
	}

	function update(){
		if(!running){
			running = true;
			requestAnimationFrame(updateFocus);
		}
	}

	document.addEventListener('focus', update, true);
	document.addEventListener('blur', update, true);

})(window, document);
