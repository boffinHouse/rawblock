(function (window, factory) {
	var myModule = factory(window, window.document);

	if (typeof module == 'object' && module.exports) {
		module.exports = myModule;
	}
}(typeof window != 'undefined' ? window : this, function (window, document) {
	'use strict';
	var rb = window.rb;
	//var $ = rb.$;

	return rb.life.Widget.extend('button', {
		defaults: {
			target: ''
		},
		init: function(element) {

			this._super(element);

			this.regTarget = /^\s*([a-z0-9-_]+)\((.+)\)\s*$/i;

			this.setupEvents();
		},
		setupEvents: function(){
			var that = this;
			this.$element.on('click', function() {
				var target = that.getTarget() || {};
				var widget = that.widget(target);

				if (!widget) {
					return;
				}

				if(widget[that.options.type]){
					widget[that.options.type]();
				} else if(widget.toggle) {
					widget.toggle();
				}
			});
		},

		setTarget: function(dom) {
			this.element.removeAttribute('data-target');
			this.$element.attr({
				'aria-controls': this.getId(dom)
			});
		},

		getTarget: function() {
			var target = this.$element.attr('data-target') || this.$element.attr('aria-controls') || '';
			if (!this.target || target != this.targetAttr) {
				this.targetAttr = target;
				this.target = null;

				if (target.match(this.regTarget)) {
					if (RegExp.$1 == 'closest') {
						this.target = this.element.closest(RegExp.$2);
					} else if (RegExp.$1 == 'sel') {
						this.target = document.querySelector(RegExp.$2);
					}
				} else if (target) {
					this.target = document.getElementById(target);
				}
			}

			return this.target;
		},
	});

}));
