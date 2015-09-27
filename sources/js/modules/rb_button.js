(function (window, document, undefined) {
	'use strict';
	var rb = window.rb;
	var $ = rb.$;

	var Button = rb.Widget.extend('button', {
		defaults: {
			target: '',
			type: 'toggle',
		},
		init: function(element) {

			this._super(element);

			this._setTarget = rb.rAF(this._setTarget, null, true);
		},
		events: {
			click: '_onClick',
		},
		_onClick: function(){
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
				this.target = rb.elementFromStr(target, this.element)[0];
			}

			return this.target;
		},
	});

})(window, document);
