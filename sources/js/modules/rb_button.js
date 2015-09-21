(function (window, factory) {
	var myModule = factory(window, window.document);

	if (typeof module == 'object' && module.exports) {
		module.exports = myModule;
	}
}(typeof window != 'undefined' ? window : this, function (window, document) {
	'use strict';
	var rb = window.rb;
	var $ = rb.$;

	var Button = rb.Widget.extend('button', {
		defaults: {
			target: '',
			type: 'toggle',
		},
		statics: {
			regTarget: /^\s*([a-z0-9-_]+)\((.+)\)\s*$/i,
			getTarget: function(targetStr){
				var target = null;
				if (targetStr.match(Button.regTarget)) {
					if (RegExp.$1 == 'closest') {
						target = this.element.closest(RegExp.$2);
					} else if ( !((RegExp.$1 || '').indexOf('sel')) ) {
						target = document.querySelectorAll(RegExp.$2);
						if(target.length < 2){
							target = target[0];
						}
					}
				} else if (targetStr) {
					target = document.getElementById(targetStr);
				}

				return target;
			}
		},
		init: function(element) {

			this._super(element);

			this._setTarget = rb.rAF(this._setTarget, null, true);

			this.clickAction = this.clickAction.bind(this);
			this.setupEvents();
		},
		setupEvents: function(){
			this.$element.on('click', this.clickAction);
		},
		clickAction: function(){
			var target = this.getTarget() || {};
			var widget = this.widget(target);

			if (!widget) {
				return;
			}

			if(widget[this.options.type]){
				widget.activeButtonWidget = this;
				widget[this.options.type]();
			}
		},
		_setTarget: function(){
			var id = this.getId(this.target);
			this.isTargeting = false;
			this.element.removeAttribute('data-target');
			this.$element.attr({
				'aria-controls': id
			});
			this.targetAttr = id;
		},
		setTarget: function(dom) {
			this.target = dom;
			this.isTargeting = true;
			this._setTarget();
		},

		getTarget: function() {
			var target = this.$element.attr('data-target') || this.$element.attr('aria-controls') || '';

			if (!this.target || (!this.isTargeting && target != this.targetAttr)) {
				this.targetAttr = target;
				this.target = Button.getTarget(target);
			}

			return this.target;
		},
	});

}));
