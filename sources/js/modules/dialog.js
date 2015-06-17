(function(window, factory) {
	var myModule = factory(window, window.document);

	if(typeof module == 'object' && module.exports){
		module.exports = myModule;
	}
}(typeof window != 'undefined' ? window : this , function(window, document) {
	'use strict';
	var dom = window.jQuery || window.dom;

	const DEFAULTS = {
		open: false,
		closeOnEsc: true,
		closeOnBackdropClick: false
	};

	class Dialog extends rbLife.Widget {
		constructor(element){

			super(element);

			this.element = element;
			this.$element = dom(element);

			this.isOpen = false;

			this.$backdrop = dom(document.createElement('div')).addClass('rb-backdrop');

			this.$element.before(this.$backdrop.get(0));
			this.$backdrop.append(this.$element.get(0));

			this.$element.attr({
				tabindex: -1,
				role: 'dialog'
			});

			this._setUpEvents();

			if(this.options.open){
				this.open();
			}
		}

		open(){
			if(this.isOpen){return false;}
			this._activeElement = document.activeElement;
			this.isOpen = true;

			this.$backdrop.addClass('is-open');

			this.setupOpenEvents();

			dom(document.documentElement).addClass('has-open-dialog');

			this.setFocus(this.element.querySelector('.primary-focus') || this.element);

			this.$element.trigger('openchange');
			return true;
		}

		setFocus(elem){
			try {
				setTimeout(() => elem.focus(), 0);
			} catch(e){}
		}

		close(){
			if(!this.isOpen){return false;}
			this.isOpen = false;

			this.teardownOpenEvents();

			if(this._activeElement){
				this.setFocus(this._activeElement);
			}

			this.$backdrop.removeClass('is-open');
			dom(document.documentElement).removeClass('has-open-dialog');
			this.$element.trigger('openchange');
			return true;
		}

		toggle(){
			this[this.isOpen ? 'close' : 'open']();
		}

		setupOpenEvents(){
			if(!this.closeOnEsc){
				this.closeOnEsc = (e) => {
					if(e.keyCode ==  27 && this.options.closeOnEsc && !e.defaultPrevented){
						this.close();
					}
				};
			}

			this.$backdrop.on('keydown', this.closeOnEsc);
		}

		teardownOpenEvents(){
			if(this.closeOnEsc){
				this.$backdrop.off('keydown', this.closeOnEsc);
			}
		}

		_setUpEvents(){
			this.$backdrop
				.on('click', '.dialog-close', (e) => {
					this.close();
					e.preventDefault();
					e.stopPropagation();
				})
				.on('click', (e) => {
					if(this.options.closeOnBackdropClick && e.target == e.currentTarget){
						this.close();
						e.preventDefault();
						e.stopPropagation();
					}
				})
			;
		}
	}

	Dialog.defaults = DEFAULTS;

	window.rbModules = window.rbModules || {};

	window.rbModules.Dialog = Dialog;

	rbLife.register('dialog', Dialog);

	return Dialog;
}));
