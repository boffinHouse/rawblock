(function (factory) {
	if (typeof module === 'object' && module.exports) {
		require('./rb_itemscroller');
		module.exports = factory();
	} else {
		factory();
	}
} (function() {
	'use strict';
	var rb = window.rb;

	var ItemScroller = rb.Component.mixin(rb.components.itemscroller,
		/** @lends rb.components.itemscroller.prototype */
		{
			/**
			 * @static
			 * @mixes rb.components.itemscroller.prototype.defaults
			 * @property {Number} autoplayDelay=2000 Delay between autoplay next and current slide.
			 * @property {Boolean} autoplay=false Activates autoplay/slide show.
			 * @property {Boolean} pauseOnHover=true Pauses slide show on mouseenter.
			 * @property {Boolean} jumpToStart=true In case of a non-carousel jumps to the first slide instead of sliding to the first slide.
			 */
			defaults: {
				autoplay: false,
				autoplayDelay: 2000,
				pauseOnHover: true,
				//pauseOnFocus: false,
				jumpToStart: true,
			},
			init: function(element){
				this._super(element);

				this._setAutoplayUI = rb.rAF(function(){
					this.$element[this.options.autoplay ? 'addClass' : 'removeClass']('is-autoplay');
				}, {that: this});
			},
			events: {
				'click .{name}-autoplay-btn': function(){
					this.setOption('autoplay', !this.options.autoplay);
				}
			},
			setOption: function(name, value){
				this._super(name, value);

				switch (name) {
					case 'autoplay':
						this[value ? 'startAutoplay' : 'stopAutoplay']();
						break;
					case 'autoplayDelay':
						if(this.options.autoplay){
							this.startAutoplay();
						}
						break;
				}
			},
			stopAutoplay: function(){
				clearInterval(this._autoplayTimer);
				if(this._onenterAutoplay){
					this.$element.off('mouseenter', this._onenterAutoplay);
				}
				if(this._onleaveAutoplay){
					this.$element.off('mouseleave', this._onleaveAutoplay);
				}

				if(!this.options.autoplay){
					this._setAutoplayUI();
				}
			},
			startAutoplay: function(){
				var that = this;
				var options = this.options;
				if(!options.autoplay){return;}
				this.stopAutoplay();

				if(!this._onenterAutoplay){
					this._onenterAutoplay = function(){
						if(options.pauseOnHover){
							clearInterval(that._autoplayTimer);
						}
					};
				}

				if(!this._onleaveAutoplay){
					this._onleaveAutoplay = function(){
						if(options.pauseOnHover && options.autoplay){
							clearInterval(that._autoplayTimer);
							that._autoplayTimer = setInterval(that._autoplayHandler, options.autoplayDelay);
						}
					};
				}

				if(!this._autoplayHandler){
					this._autoplayHandler = function(){
						if(that.isCarousel || that.selectedIndex + 1 < that.baseLength){
							that.selectNext();
						} else {
							that.selectIndex(0, options.jumpToStart);
						}
					};
				}

				this.$element.on('mouseenter', this._onenterAutoplay);
				this.$element.on('mouseleave', this._onleaveAutoplay);


				clearInterval(that._autoplayTimer);
				that._autoplayTimer = setInterval(this._autoplayHandler, options.autoplayDelay);

				this._setAutoplayUI();
			},
			attached: function(){
				if(this.options.autoplay){
					this.startAutoplay();
				}
			},
			detached: function(){
				this.stopAutoplay();
			},
		}
	);

	return ItemScroller;
}));
