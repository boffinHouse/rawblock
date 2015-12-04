( function() {
	'use strict';
	/* jshint eqnull: true */
	var rb = window.rb;
	var $ = rb.$;

	var Position = function(element, options){

		if(element[Position.expando]){
			this.log('is already positioned');
			return element[Position.expando];
		}
		if(!(this instanceof Position)){
			return new Position(element, options);
		}

		this.element = element;
		this.$element = $(element);
		this.elemCstyle = rb.getStyles(this.element);

		this.position = rb.rAF(this._position, {that: this});
		this.options = {};

		this.pos = {
			top: 0,
			left: 0,
		};
		this.flipped = {
			x: '',
			y: '',
		};

		this.setOptions(options);

		this.position(this.element, {
			left: '-999px',
			position: 'absolute',
			bottom: 'auto',
			right: 'auto'
		});

		element[Position.expando] = this;
	};

	Object.assign(Position, {
		regWhite:  /\s+/g,
		expando: rb.Symbol('_rbPosition'),
		labels: {
			top: '0',
			left: '0',
			center: '50',
			middle: '50',
			right: '100',
			bottom: '100',
		},
		isHorizontal: {
			left: 1,
			right: 1,
		},
		margins: ['marginTop', 'marginLeft', 'marginBottom', 'marginRight'],
		posType: {
			top: {
				dim: 'height',
				rootDim: 'clientHeight',
				margins: ['marginTop', 'marginBottom'],
				axisIndex: 1,
				axis: 'y',
			},
			left: {
				dim: 'width',
				rootDim: 'clientWidth',
				margins: ['marginLeft', 'marginRight'],
				axisIndex: 0,
				axis: 'x',
			},
		},
	});

	Object.assign(Position.prototype, {
		_position: function(element, props){
			var prop, value;
			var style = element.style;
			for(prop in props){
				value = props[prop];
				if(typeof value == 'number'){
					value = value + 'px';
				}
				style[prop] = value;
			}

			this.element.classList[this.flipped.x ? 'add' : 'remove']('is-flipped-x');
			this.element.classList[this.flipped.y ? 'add' : 'remove']('is-flipped-y');
		},
		parsePosOption: function(str, number){
			var i;
			str = str.split(Position.regWhite);

			if(!str[1]){
				str[1] = str[0];
			}

			if(Position.isHorizontal[str[1]]){
				this.log('use horizontal position values before vertical ones: "left top", instead of "top left"');
			}

			for(i = 0; i < 2; i++){

				if((str[i] in Position.labels)){
					str[i] = Position.labels[str[i]];
				}
				if(number){
					str[i] = (parseFloat(str[i]) || 0);
				}
			}

			return str;
		},
		setOptions: function(options){
			var my = this.options.my;
			var at = this.options.at;
			var collision = this.options.collision;
			this.options = Object.assign({
				my: '0 0',
				at: '0 100',
				collision: 'flip',
				anchor: null,
				using: this.position
			}, this.options, options);

			if(my !== this.options.my){
				this.my = this.parsePosOption(this.options.my, 1);
			}
			if(at !== this.options.at){
				this.at = this.parsePosOption(this.options.at, 1);
			}
			if(collision !== this.options.collision){
				this.collision = this.parsePosOption(this.options.collision);
			}

			return this;
		},
		getBoxLayout: function(element, offset, useMargin){
			var i, styles;
			var box = element.getBoundingClientRect();
			box = {
				top: box.top,
				left: box.left,
				height: box.height,
				width: box.width,
			};

			if(useMargin){
				styles = rb.getStyles(element);
				for(i = 0; i < 4; i++){
					box[Position.margins[i]] = $.css(element, Position.margins[i], true, styles);
				}
			}

			return box;
		},
		addOffset: function(posType, box, offset, useMargin){
			var marginIndex;
			var props = Position.posType[posType];

			var ret = (box[posType] + box[props.dim] * (offset[props.axisIndex] / 100));

			if(useMargin && (offset[props.axisIndex] < 25 || offset[props.axisIndex] > 75)){
				marginIndex = (offset[props.axisIndex] < 50 ? 0 : 1);
				if(marginIndex == 1){
					ret += box[props.margins[marginIndex]];
				} else {
					ret -= box[props.margins[marginIndex]];
				}
			}

			return ret;
		},
		calculatePosition: function(posType, targetBox, elementBox, targetOffset, elementOffset, computedPosition){
			var rootDim, rootPos, isOut1, isOut2, targetOffset2, elementOffset2;
			var props = Position.posType[posType];
			var position = this.addOffset(posType, targetBox, targetOffset) - this.addOffset(posType, elementBox, elementOffset, true) + this.pos[posType];

			if(this.collision[props.axisIndex] == 'flip'){
				rootDim = rb.root[props.rootDim];
				rootPos = elementBox[posType] + (position - this.pos[posType]);
				isOut1 = rootPos < 0;
				isOut2 = rootPos + elementBox[props.dim] > rootDim;

				if((isOut1 || isOut2)){
					this.flipped[props.axis] = true;
					if(computedPosition != null){
						this.flipped[props.axis] = false;
						position = computedPosition;
					} else if((isOut1 && elementOffset[props.axisIndex] > 75 && targetOffset[props.axisIndex] < 25) ||
						(isOut2 && elementOffset[props.axisIndex] < 25 && targetOffset[props.axisIndex] > 75) ){
						targetOffset2 = {};
						elementOffset2 = {};

						targetOffset2[props.axisIndex] = Math.abs(targetOffset[props.axisIndex] - 100);
						elementOffset2[props.axisIndex] = Math.abs(elementOffset[props.axisIndex] - 100);
						position = this.calculatePosition(posType, targetBox, elementBox, targetOffset2, elementOffset2, position);
					}
				}

			}

			return position;
		},
		connect: function(target, immediate){
			var pos, targetBox, elementBox;
			var options = this.options;
			this.pos.top = $.css(this.element, 'top', 1, this.elemCstyle);
			this.pos.left = $.css(this.element, 'left', 1, this.elemCstyle);
			this.flipped.x = false;
			this.flipped.y = false;

			if(typeof this.pos.top != 'number'){
				this.pos.top = 0;
				this.element.style.top = '0px';
			}
			if(typeof this.pos.left != 'number'){
				this.pos.left = 0;
				this.element.style.left = '0px';
			}

			targetBox = this.getBoxLayout(target || options.anchor, this.at);
			elementBox = this.getBoxLayout(this.element, this.my, true);

			pos = {
				top: this.calculatePosition('top', targetBox, elementBox, this.at, this.my),
				left: this.calculatePosition('left', targetBox, elementBox, this.at, this.my),
			};

			this.pos.top = pos.top;
			this.pos.left = pos.left;


			if(immediate && this.options.using._rbUnrafedFn){
				this.options.using._rbUnrafedFn.call(this, this.element, this.pos);
			} else {
				this.options.using.call(this, this.element, this.pos, this.flipped);
			}
			return this;
		}
	});

	rb.position = Position;

	var Popover = rb.components.panel.extend('popover',
		/** @lends rb.components.popover.prototype */
		{
			/**
			 * @static
			 * @mixes rb.components.panel.prototype.defaults
			 * @property {Object} defaults
			 * @prop {Boolean} positioned=true indicates wether the panel is positioned
			 * @prop {String} my='left top' Indicates the position of the panel. First x than y. Possible values for x 'left', 'center', 'right'. Possible values for y: 'top', 'middle', 'bottom'. Or numeric value: '0' indicates 'left' or 'top' and '50' 'center'/'middle'
			 * @prop {String} at='left bottom' Indicates the position of the anchor element. Same possible values as 'my'
			 * @prop {String} collision='flip' The collision handling. Possible values: 'flip', 'none'. Can be declared separatly for x and y. (i.e. 'flip none')
			 * @prop {String} anchor='button' The anchor element to position the panel against. 'button' means the associated panelbutton module or if no associated panelbutton is found the opening button module. Accepts als string that are processed with rb.elementFromStr.
			 * @prop {Boolean} updateOnResize=true Wether panel position should be updated on resize.
			 * @prop {Boolean} closeOnOutsideClick=true Closes panel on outside click.
			 */
			defaults: {
				positioned: true,
				my: 'left top',
				at: 'left bottom',
				collision: 'flip',
				anchor: 'button', // 'button' || 'activeButton' || 'id' || closest(.bla) || sel(.yo)
				updateOnResize: true,
				closeOnOutsideClick: true,
			},
			statics: {
				mainbutton: {
					button: 1,
					mainButton: 1,
					panelButton: 1,
				}
			},
			/**
			 * @constructs
			 * @classdesc Creates a popover that is positioned/anchored to another element.
			 *
			 * A11y-Notes: If the popover has structured content use the class `js-autofocus` inside of/at the popover. If it contains simple text use a aria-live="polite" or an appropriate role.
			 *
			 * @extends rb.components.panel
			 *
			 * @param element
			 *
			 * @example
			 * <button aria-controls="popover-1" data-module="panelbutton" type="button" class="js-click">button</button>
			 * <div id="popover-1" data-module="popover">
			 *    {{popoverContent}}
			 * </div>
			 */
			init: function(element){
				this._super(element);

				this.reflow = rb.throttle(this.reflow, {that: this});

				if(this.options.positioned){
					this.setOption('positioned', true);
				}
			},
			setOption: function(name, value){
				var options = this.options;
				this._super(name, value);

				if(name == 'positioned'){
					if(value){
						if(!this.position){
							this.initPositionedElement();
						} else {
							this.$element.css({position: 'absolute'});
						}
					} else {
						this.$element.css({position: '', left: '', top: ''});
					}
				} else if(this.position && name == 'my' || name == 'at' || name == 'collision'){
					this.position.setOptions({
						my: options.my,
						at: options.at,
						collision: options.collision
					});
				}
			},
			initPositionedElement: function(){
				var that = this;

				this.position = rb.position(this.element);

				rb.rAFQueue(function(){
					that.$element.css({display: 'block'});
				});
				this.setOption('my', this.options.my);
			},
			reflow: function(e){
				if(!rb.root.contains(this.element)){
					this.teardownPopoverResize();
					return;
				}
				if((!e || this.options.updateOnResize)){
					this.connect(false, this.lastOpeningOptions);
				}
			},
			setupPopoverResize: function(){
				this.teardownPopoverResize();
				addEventListener('resize', this.reflow);
			},
			teardownPopoverResize: function(){
				removeEventListener('resize', this.reflow);
			},
			getAnchor: function(options){
				var anchor = options && options.anchor || this.options.anchor || '';

				if(anchor.nodeType != 1){
					if(anchor == 'activeButton'){
						anchor = (this.activeButtonComponent && this.activeButtonComponent.element) || (this.buttonComponent && this.buttonComponent.element);
					} else if(Popover.mainbutton[anchor]){
						anchor = (this.buttonComponent && this.buttonComponent.element) || (this.activeButtonComponent && this.activeButtonComponent.element);
					} else if(typeof anchor == 'string') {
						anchor = rb.elementFromStr(anchor, this.element)[0];
					}
				}

				return anchor;
			},
			connect: function(isOpening, options){
				var anchor = (isOpening || this.isOpen) && this.getAnchor(options);

				if(anchor && this.position){
					this.position.connect(anchor);
				}
			},
			/**
			 * Opens the popover
			 * @param {Object} options
			 * @param {String|Element} options.anchor Overrides anchor option of instance for current opening.
			 * @returns {Boolean}
			 */
			open: function(options){
				var isOpening = this._super.apply(this, arguments);
				this.lastOpeningOptions = options;

				if(this.options.positioned){
					this.connect(isOpening, options);
					if(isOpening && this.options.updateOnResize){
						this.setupPopoverResize();
					}
				}

				return isOpening;
			},
			close: function(options){
				var isClosing = this._super.apply(this, arguments);

				if(this.options.positioned){
					if(isClosing){
						this.lastOpeningOptions = null;
						this.teardownPopoverResize();
					}
				}
				return isClosing;
			}
		}
	);
})();
