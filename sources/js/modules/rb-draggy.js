(function() {
	'use strict';
	var rb = window.rb;
	var $ = rb.$;

	function Draggy(element, options){

		this.element = element;
		this.options = Object.assign({}, Draggy._defaults, options);

		this.reset();

		this.setupEvents();
		this.setupMouse();
		this.setupTouch();
	}

	Draggy._defaults = {
		move: $.noop,
		start: $.noop,
		end: $.noop,
		preventClick: true,
		preventMove: true,
		useMouse: true,
		useTouch: true,
		horizontal: true,
		vertical: true,
	};

	Object.assign(Draggy.prototype, {
		hasRelevantChange: function(){
			return (this.options.horizontal && this.lastPos.x != this.curPos.x) || (this.options.vertical && this.lastPos.y != this.curPos.y);
		},
		reset: function(){
			this.isType = '';
			this.allowMouse = true;
			this.allowTouch = true;
			this.startPos = {};
			this.lastPos = {};
			this.relPos = {};
			this.curPos = {};
		},
		start: function(pos, evt){
			this.startPos = {
				x: pos.pageX,
				y: pos.pageY,
			};
			this.curPos = {
				x: pos.pageX,
				y: pos.pageY,
			};
			this.options.start(this);
		},
		move: function(pos, evt){
			this.lastPos = this.curPos;
			this.curPos = {
				x: pos.pageX,
				y: pos.pageY,
			};

			if(!this.hasRelevantChange()){
				return;
			}

			if(this.options.preventMove){
				evt.preventDefault();
			}

			this.relPos.x = this.lastPos.x - this.curPos.x;
			this.relPos.y = this.lastPos.y - this.curPos.y;

			this.options.move(this);
		},
		end: function(pos, evt){
			if(this.options.preventClick && (Math.abs(this.lastPos.x - this.startPos.x) > 15 || Math.abs(this.lastPos.y - this.startPos.y) > 15)){
				this.preventClick(evt);
			}
			this.options.end(this);

			this.reset();
		},
		preventClick: function(evt){
			var that = this;
			that.isClickPrevented = true;
			clearTimeout(this._preventClickTimer);
			this._preventClickTimer = setTimeout(function(){
				that.isClickPrevented = false;
			}, 333);
			if(evt && evt.preventDefault){
				evt.preventDefault();
			}
		},
		setupEvents: function(){
			var that = this;
			this._onclick = function(e){
				if(that.isClickPrevented){
					e.preventDefault();
					e.stopImmediatePropagation();
				}
			};
			this.element.addEventListener('click', this._onclick, true);
		},
		setupMouse: function(){
			var timer;
			var that = this;

			var move = function(e){
				that.move(e, e);
			};

			var up = function(e){
				that.allowTouch = true;
				destroy();
				that.end(e, e);
			};

			var destroy = function(){
				clearTimeout(timer);
				document.removeEventListener('mousemove', move);
				document.removeEventListener('mousedown', destroy);
				document.removeEventListener('mouseup', up);
			};

			this._onmousedown = function(e){
				destroy();
				if(e.defaultPrevented || !that.options.useMouse || !that.allowMouse){return;}
				that.allowTouch = false;
				that.isType = 'mouse';


				timer = setTimeout(function(){
					document.addEventListener('mousedown', destroy);
				});

				document.addEventListener('mousemove', move);
				document.addEventListener('mouseup', up);

				that.start(e, e);
			};

			this.element.addEventListener('mousedown', this._onmousedown);
		},
		setupTouch: function(){
			var timer;
			var that = this;

			var move = function(e){
				that.move((e.changedTouches || e.touches)[0], e);
			};

			var end = function(e){
				that.allowMouse = true;
				destroy();
				that.end((e.changedTouches || e.touches)[0], e);
			};

			var destroy = function(){
				clearTimeout(timer);
				document.removeEventListener('mousemove', move);
				document.removeEventListener('mousedown', destroy);
				document.removeEventListener('mouseup', end);
			};

			this._ontouchstart = function(e){
				if(e.touches.length != 1){return;}
				destroy();
				if(e.defaultPrevented || !that.options.useTouch || !that.allowTouch || !e.touches[0]){return;}
				that.allowMouse = false;
				that.isType = 'touch';

				e.target.addEventListener('touchmove', move);
				e.target.addEventListener('touchend', end);

				that.start(e.touches[0], e);
			};

			this.element.addEventListener('touchstart', this._ontouchstart);
		},
		destroy: function(){
			this.element.removeEventListener('touchstart', this._ontouchstart);
			this.element.removeEventListener('mousedown', this._onmousedown);
			this.element.removeEventListener('click', this._onclick, true);
		},
	});

	rb.Draggy = Draggy;

	$.fn.draggy = function(options){
		return this.each(function(){
			if(options == 'destroy'){
				if(this._rbDraggy){
					this._rbDraggy.destroy();
				}
			} else {
				this._rbDraggy = new Draggy(this, options || {});
			}
		});
	};
})();
