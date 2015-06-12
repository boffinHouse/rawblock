(function(window, factory) {
	var myModule = factory(window, window.document);

	if(typeof module == 'object' && module.exports){
		module.exports = myModule;
	}
}(typeof window != 'undefined' ? window : this , function(window, document) {
	'use strict';
	var dom = window.jQuery || window.dom;


	class Dialog {
		constructor(element, options){

			this.element = element;
			this.$element = dom(element);
			this.options = options;

			this.isOpen = false;

			this.$backdrop = dom(document.createElement('div')).addClass('rb-backdrop');

			this.$element.before(this.$backdrop.get(0));
			this.$backdrop.append(this.$element.get(0));

			this.$element.attr({
				tabindex: -1,
				role: 'dialog'
			});

			this._setUpEvents();

			if(options.open){
				this.open();
			}
		}

		open(){
			if(this.isOpen){return;}
			this._activeElement = document.activeElement;
			this.isOpen = true;

			this.$backdrop.addClass('is-open');

			dom(document.documentElement).addClass('has-open-dialog');

			setTimeout(() => this.element.focus());
			this.$element.trigger('openchange');
		}

		close(){
			if(!this.isOpen){return;}
			this.isOpen = false;

			if(this._activeElement){
				setTimeout(() => {
						this._activeElement.focus();
						this._activeElement = null
					});
			}

			this.$backdrop.removeClass('is-open');
			dom(document.documentElement).removeClass('has-open-dialog');
			this.$element.trigger('openchange');
		}

		toggle(){
			this[this.isOpen ? 'close' : 'open']();
		}

		_setUpEvents(){
			this.$backdrop.on('click', '.dialog-close', (e) => {
				this.close();
				e.preventDefault();
				e.stopPropagation();
			});
		}

	}

	window.rbModules = window.rbModules || {};

	window.rbModules.Dialog = Dialog;

	rbLife.register('dialog', Dialog);
}));
