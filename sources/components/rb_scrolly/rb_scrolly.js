(function(){
	'use strict';

	var rb = window.rb;
	var $ = rb.$;

	var docElem = document.documentElement;

	var Scrolly = (rb.components._childfx || rb.Component).extend('scrolly',
		/** @lends rb.components.scrolly.prototype */
		{
			/**
			 * @mixes rb.components._childfx.prototype.defaults
			 * @prop {{}} defaults
			 * @prop {String} switchedOff=false Switches the component off.
			 * @prop {String} from='-100eh' Start point of in range position relative to viewport top. Can be a simple calculation (addition and subtraction) with the following units (vh = viewport height / 100, vw = viewport width / 100, eh = element height  / 100, ew = element width / 100, px). See also 'to'.
			 * @prop {String} to='100vh' End point of in range position relative to viewport top. Example: '100vh' places the top of the element at the bottom of the viewport. '100vh - 20eh' Means 20% of the elements top is visible at the bottom of the viewport.
			 * @prop {Boolean|String} once=false Possible values: true, false, 'entered'. Whether the component should destroy itself after it was executed once.
			 * @prop {Boolean} restSwitchedOff=true Whether there should be a full reset after switchedOff option change.
			 * @prop {Number} throttleDelay=0 Delay in ms to check for position change. Setting this to a higher number (50-300) can improve performance.
			 * @prop {String} defaults.childSel='find(.scrolly-element)' Child elements that should be animated. String is processed by rb.elementFromStr.
			 */
			defaults: {
				switchedOff: false,
				from: '-100eh',
				to: '100vh',
				once: false,
				restSwitchedOff: true,
				throttleDelay: 0,
				childSel: 'find(.scrolly-element)',
			},
			statics: {
				regWhite: /\s/g,
				regCalc: /(([+-]*\d+[\.\d]*)(px|vh|eh|vw|ew))/g,
				knownUnits: {vh: 1, eh: 1, vw: 1, ew: 1},
			},
			/**
			 * @constructs
			 * @param element
			 *
			 * @classdesc Adds a class `is-in-scrollrange` if component is inside of a defined viewport range. Additionally can animate child elements based on this range progress.
			 *
			 * @extends rb.components._childfx
			 *
			 * @example
			 * <style type="sass">
			 *     .rb-logos {
			 *          (at)include exportToJS((
			 *              from: '-50eh',
			 *              to: '100vh - 50eh',
			 *              once: true,
			 *              throttleDelay: 300,
			 *          ));
			 *
			 *          .logo {
			 *              opacity: 0;
			 *              transition: all 400ms;
			 *          }
			 *
			 *          &.is-in-scrollrange {
			 *              .logo {
			 *                  opacity: 1;
			 *              }
			 *          }
			 *     }
			 * </style>
			 *
			 * <div class="rb-logos js-rb-life" data-module="scrolly">
			 *     <img class="logo" src="..." />
			 * </div>
			 *
			 * @example
			 * <style type="sass">
			 *     .rb-logos {
			 *          (at)include exportToJS((
			 *              from: "-50eh",
			 *              to: "100vh - 50eh",
			 *              once: true,
			 *              throttleDelay: 100,
			 *              childSel: 'find(.logo)',
			 *          ));
			 *
			 *          .logo {
			 *              top: 0;
			 *              transition: all 50ms;
			 *
			 *              (at)include exportToJS((
			 *                  top: 50,
			 *                  //complicated values like transform/backgroundColor...
			 *                  rotate: (
			 *                      start: "rotate(0deg)",
			 *                      end: "rotate(10deg)",
			 *                  )
			 *              ));
			 *          }
			 *     }
			 * </style>
			 *
			 * <div class="rb-logos js-rb-life" data-module="scrolly">
			 *     <img class="logo" src="..." />
			 * </div>
			 *
			 */
			init: function(element){
				this._super(element);

				this.minScroll = Number.MAX_VALUE;
				this.maxScroll = -1;

				this.checkTime = 4000 + (999 * Math.random());

				this.entered = false;

				this.onprogress = $.Callbacks();

				this.scrollingElement = rb.getScrollingElement();

				this.updateChilds = this.updateChilds || $.noop;
				this.changeState = rb.rAF(this.changeState);

				this.onprogress.fireWith = rb.rAF(this.onprogress.fireWith);

				this.checkPosition = this.checkPosition.bind(this);
				this.calculateLayout = this.calculateLayout.bind(this);
				this._setupThrottleDelay(this.options.throttleDelay);

				this.reflow = rb.throttle(function(){
					if(this.checkChildReflow){
						this.checkChildReflow();
					}
					this.calculateLayout();
				}, {that: this});

				this.parseOffsets();
				this.calculateLayout();
			},
			_setupThrottleDelay: function(delay){
				if(delay && delay > 30){
					this.throtteldCheckPosition = rb.throttle(this.checkPosition, {delay: delay});
				} else {
					this.throtteldCheckPosition = this.checkPosition;
				}
			},
			setOption: function(name, value){
				this._super(name, value);
				if(name == 'switchedOff' || name == 'restSwitchedOff' && this.options.switchedOff && this.options.restSwitchedOff){
					this.changeState(false);
					this.updateChilds(true);
					this.progress = -2;
				} else if(name == 'from' || name == 'to' || (name == 'switchedOff' && !value)){
					this.parseOffsets();
					this.calculateLayout();
				} else if(name == 'throttleDelay'){
					this.detached();
					this._setupThrottleDelay(value);
					if(rb.root.contains(this.element)){
						this.attached();
					}
				}
			},
			parseOffsets: function(){
				this.parsedFrom = this.parseOffset(this.options.from);
				this.parsedTo = this.parseOffset(this.options.to);
			},
			parseOffset: function(val){
				var prop;
				val = ('' + val).replace(Scrolly.regWhite, '');
				var match = Scrolly.regCalc.exec(val);
				var parsedPos = {};

				while(match != null){
					prop = Scrolly.knownUnits[match[3]] ? match[3] : 'px';
					parsedPos[prop] = parseFloat(match[2]);
					match = Scrolly.regCalc.exec(val);
				}

				return parsedPos;
			},
			addOffset: function(offset){
				var prop, element, dimProp;
				var value = 0;
				for(prop in offset){
					if(prop == 'eh' || prop == 'ev'){
						element = this.element;
					} else if(prop == 'vw' || prop == 'vh'){
						element = docElem;
					}

					if(element){
						dimProp = prop.charAt(1) == 'w' ?
							'clientWidth' :
							'clientHeight'
						;
						value += element[dimProp] / 100 * offset[prop];
					} else {
						value += offset[prop];
					}
				}
				return value;
			},
			calculateLayout: function(){

				if(this.options.switchedOff){return;}
				var box = this.element.getBoundingClientRect();

				this.lastCheck = Date.now();

				if(!box.top && !box.bottom && !box.right && !box.left){return;}

				this.minScroll = box.top + this.scrollingElement.scrollTop;
				this.maxScroll = this.minScroll;

				this.minScroll -= this.addOffset(this.parsedTo);
				this.maxScroll -= this.addOffset(this.parsedFrom);

				this.checkPosition();
			},
			checkPosition: function(){
				var that, wasProgress, shouldEnter;
				if(this.options.switchedOff){return;}
				var progress;
				var pos = this.scrollingElement.scrollTop;

				if(Date.now() - this.lastCheck > this.checkTime){
					this.lastCheck = Date.now();
					setTimeout(this.calculateLayout, 99 * Math.random());
				}

				shouldEnter = this.minScroll <= pos && this.maxScroll >= pos;

				if(shouldEnter || (this.progress !== 0 && this.progress !== 1)){
					progress = Math.max(Math.min((pos - this.minScroll) / (this.maxScroll - this.minScroll), 1), 0);
					wasProgress = this.progress;
					this.progress = progress;

					if(wasProgress == progress || (wasProgress == -2 && !progress)){return;}

					this.updateChilds();
					this.onprogress.fireWith(this, [progress]);

					if(this.options.once === true && this.progress === 1){
						that = this;
						shouldEnter = true;
						rb.rAFQueue(function(){
							that.destroy();
						});
					}
				}

				if(this.entered != shouldEnter){
					this.changeState(shouldEnter);
				}
			},
			changeState: function(shouldEnter){
				var once = this.options.once;
				if(this.entered != shouldEnter){
					this.entered = shouldEnter;
					this.element.classList[shouldEnter ? 'add' : 'remove']('is-in-scrollrange');
					this._trigger();

					if(once == 'entered' || (once && (!this.childs || !this.childs.length))){
						this.destroy();
					}
				}
			},
			attached: function(){
				this.detached();
				window.addEventListener('scroll', this.throtteldCheckPosition);
				rb.resize.on(this.reflow);
				clearInterval(this.layoutInterval);
				this.layoutInterval = setInterval(this.reflow, Math.round(9999 + (5000 * Math.random())));
			},
			detached: function(){
				window.removeEventListener('scroll', this.throtteldCheckPosition);
				rb.resize.off(this.reflow);
				clearInterval(this.layoutInterval);
			},
		}
	);

	if(!rb.components._childfx){
		rb.log('_childfx not included');
	}
})();
