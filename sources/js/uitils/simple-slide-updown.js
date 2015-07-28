(function(){
	'use strict';
	var dom = (window.rbLife && rbLife.$) || window.jQuery || window.dom;

	dom.fn.rbSlideUp = function(options){
		if(!options){
			options = {};
		}

		this
			.stop()
			.css({overflow: 'hidden', display: 'block', visibility: 'visible'})
			.animate({height: 0}, {
				duration: options.duration || 400,
				easing: options.easing,
				always: function(){
					this.style.display = '';
					this.style.visibility = '';

					if(options.always){
						return options.always.apply(this, arguments);
					}
				},
			})
		;
	};

	dom.fn.rbSlideDown = function(options){
		if(!options){
			options = {};
		}

		return this.each(function(){
			var endValue;
			var $panel = dom(this);
			var height = this.style.height;

			$panel.css({overflow: 'hidden', display: 'block', height: 'auto', visibility: 'visible'});

			endValue = this.offsetHeight;

			$panel
				.css({height: height})
				.animate({height: endValue}, {
					duration: options.duration || 400,
					easing: options.easing,
					always: function(){
						this.style.overflow = '';
						this.style.height = '';

						if(options.always){
							return options.always.apply(this, arguments);
						}
					},
				})
			;
		});
	};
})();
