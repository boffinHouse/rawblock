(function () {
    'use strict';
    var rb = window.rb;
    var $ = rb.$;

    var btnsMap = {
        image: 1,
        file: 1,
        button: 1,
        submit: 1,
    };

    var regInputs = /^(?:input|textarea)$/i;
    var usePointer = window.PointerEvent && (!window.TouchEvent || !window.Touch || !window.TouchList);
    var usePassiveListener = !usePointer && rb.cssSupports('(touch-action: pan-y)') && rb.cssSupports('(touch-action: none)') && (function(){
        var supportsPassiveOption = false;
        try {
            var opts = Object.defineProperty({}, 'passive', {
                get: function() {
                    supportsPassiveOption = true;
                },
            });
            window.addEventListener('test' + rb.getID(), null, opts);
        } catch (e) {} // eslint-disable-line no-empty
            return supportsPassiveOption;
    })();
    var useTouchAction = usePassiveListener || usePointer;
    var touchOpts = usePassiveListener ? {passive: true} : false;

    function Draggy(element, options) {

        this.element = element;
        this.options = Object.assign({}, Draggy._defaults, options);
        this.destroyed = false;

        this._velDelay = 333;

        this.velocitySnapShot = this.velocitySnapShot.bind(this);

        rb.rAFs(this, {throttle: true}, 'setTouchAction');

        this.reset();

        this.setupEvents();
        this.setTouchAction();

        if(this.options.useMouse){
            this.setupMouse();
        }

        if(this.options.useTouch){
            if(usePointer){
                this.setupPointer();
            } else {
                this.setupTouch();
            }
        }
    }

    Draggy._defaults = {
        move: $.noop,
        start: $.noop,
        end: $.noop,
        preventClick: true,
        preventMove: true,
        useMouse: true,
        useTouch: true,
        usePointerMouse: false,
        horizontal: true,
        vertical: true,
        exclude: false,
        stopPropagation: true,
    };

    Object.assign(Draggy.prototype, {
        setTouchAction: function(){
            if(!useTouchAction){return;}
            var style = '';

            if(!this.destroyed){
                if(!this.options.horizontal){
                    style = 'pan-x';
                } else if(!this.options.vertical){
                    style = 'pan-y';
                } else {
                    style = 'none';
                }
            }

            this.element.style.touchAction = style;
        },
        hasRelevantChange: function () {
            var horizontalDif, verticalDif;
            var options = this.options;
            var ret = true;
            if (options.horizontal != options.vertical) {
                horizontalDif = Math.abs(this.lastPos.x - this.curPos.x);
                verticalDif = Math.abs(this.lastPos.y - this.curPos.y);

                ret = (options.horizontal && horizontalDif * 0.8 > verticalDif) || (options.vertical && verticalDif * 0.8 > horizontalDif);

                if (!ret && ((horizontalDif < 2 && verticalDif < 2))) {
                    ret = 'undecided';
                }
            }
            return ret;
        },
        reset: function () {
            this.isType = '';
            this.allowMouse = true;
            this.allowTouch = true;
            this.startPos = {};
            this.lastPos = {};
            this.relPos = {};
            this.curPos = {};
            this.velTime = null;
            this.horizontalVel = 0;
            this.verticalVel = 0;
            this.allowClick = $.noop;
        },
        velocitySnapShot: function () {
            var velTiming;

            if (this.velTime) {
                velTiming = (Date.now() - this.velTime);

                if (velTiming > 99 || (!this.horizontalVel && !this.verticalVel)) {
                    velTiming = (velTiming / this._velDelay) || 1;

                    this.velPos = this._velPos;
                    this.horizontalVel = Math.abs(this.velPos.x - this.curPos.x) || 1;
                    this.verticalVel = Math.abs(this.velPos.y - this.curPos.y) || 1;

                    this.verticalVel /= velTiming;
                    this.horizontalVel /= velTiming;
                }
            }

            this._velPos = this.curPos;
            this.velTime = Date.now();
        },
        start: function (pos, evt) {
            var options = this.options;

            this.startPos = {
                x: pos.clientX,
                y: pos.clientY,
                pX: pos.pageX,
                pY: pos.pageY,
            };
            this.movedPos = {
                x: 0,
                y: 0,
            };
            this.curPos = this.startPos;

            this.relevantChange = false;

            if(options.stopPropagation){
                evt.stopImmediatePropagation();
            }

            clearInterval(this._velocityTimer);
            this._velocityTimer = setInterval(this.velocitySnapShot, this._velDelay);
            this.velocitySnapShot();

            options.start(this, evt);
        },
        move: function (pos, evt) {
            var options = this.options;

            this.lastPos = this.curPos;
            this.curPos = {
                x: pos.clientX,
                y: pos.clientY,
                pX: pos.pageX,
                pY: pos.pageY,
            };

            if (this.relevantChange !== true && !(this.relevantChange = this.hasRelevantChange())) {
                this.end(pos, evt);
                return;
            }

            if (options.preventMove && this.relevantChange != 'undecided' && !usePassiveListener) {
                evt.preventDefault();
            }
            if(options.stopPropagation){
                evt.stopImmediatePropagation();
            }

            this.movedPos.x = this.startPos.x - this.curPos.x;
            this.movedPos.y = this.startPos.y - this.curPos.y;
            this.relPos.x = this.lastPos.x - this.curPos.x;
            this.relPos.y = this.lastPos.y - this.curPos.y;

            options.move(this, evt);
        },
        end: function (pos, evt) {
            var options = this.options;
            var preventClick = options.preventClick;
            clearInterval(this._velocityTimer);
            this.velocitySnapShot();

            this.allowClick = function () {
                preventClick = false;
            };

            if(this._destroyTouch){
                this._destroyTouch();
            } else if(this._destroyPointer){
                this._destroyPointer();
            }

            if(this._destroyMouse){
                this._destroyMouse();
            }

            this.movedPos.x = this.startPos.x - this.curPos.x;
            this.movedPos.y = this.startPos.y - this.curPos.y;

            options.end(this, evt);

            if((Math.abs(this.lastPos.x - this.startPos.x) > 15 || Math.abs(this.lastPos.y - this.startPos.y) > 15)){
                if(options.stopPropagation){
                    evt.stopImmediatePropagation();
                }
                if (preventClick) {
                    this.preventClick(evt);
                }
            }
            this.reset();
        },
        preventClick: function (evt) {
            var that = this;
            that.isClickPrevented = true;
            clearTimeout(this._preventClickTimer);
            this._preventClickTimer = setTimeout(function () {
                that.isClickPrevented = false;
            }, 333);

            if (evt && evt.preventDefault && (!usePassiveListener || (evt.type != 'touchend' && evt.type != 'pointerup'))) {
                evt.preventDefault();
            }
        },
        setupEvents: function () {
            var that = this;

            this._onclick = function (e) {
                if (that.isClickPrevented) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            };

            this._onSelectStart = function (e) {
                if (that.allowedDragTarget(e.target)) {
                    e.preventDefault();
                }
            };

            this.element.addEventListener('click', this._onclick, true);
            this.element.addEventListener('selectstart', this._onSelectStart, true);
        },
        allowedDragTarget: function(target){
            return (btnsMap[target.type] || !regInputs.test(target.nodeName || '') && (!this.options.exclude || !target.closest(this.options.exclude)));
        },
        setupMouse: function () {
            var timer;
            var that = this;

            var move = function (e) {
                if (!e.buttons && !e.which) {
                    up(e);
                    that._destroyMouse();
                    return;
                }
                that.move(e, e);
            };

            var up = function (e) {
                that._destroyMouse();
                that.end(e, e);
            };

            this._destroyMouse = function () {
                that.allowTouch = true;
                clearTimeout(timer);
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            };

            this._onmousedown = function (e) {
                that._destroyMouse();
                if (e.defaultPrevented || e.button || !that.options.useMouse || !that.allowMouse || !that.allowedDragTarget(e.target)) {
                    return;
                }

                if(e.target.nodeName != 'SELECT'){
                    e.preventDefault();
                }
                that.allowTouch = false;
                that.isType = 'mouse';

                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', up);

                that.start(e, e);
            };

            this.element.addEventListener('mousedown', this._onmousedown);
        },
        setupTouch: function () {
            var identifier;
            var that = this;
            var getTouch = function(touches){
                var i, len, touch;

                for(i = 0, len = touches.length; i < len; i++){
                    if(touches[i].identifier == identifier){
                        touch = touches[i];
                        break;
                    }
                }

                return touch;
            };

            var move = function (e) {
                var touch = getTouch(e.changedTouches || e.touches);
                if(touch){
                    that.move(touch, e);
                }
            };

            var end = function (e) {
                var touch = getTouch(e.changedTouches || e.touches);

                if(touch) {
                    that.allowMouse = true;
                    that._destroyTouch();
                    that.end(touch, e);
                    identifier = undefined;
                }
            };

            this._destroyTouch = function () {
                that.element.removeEventListener('touchmove', move, touchOpts);
                that.element.removeEventListener('touchend', end, touchOpts);
                that.element.removeEventListener('touchcancel', end, touchOpts);
            };

            this._ontouchstart = this._ontouchstart || function (e) {
                if (e.touches.length != 1) {
                    return;
                }

                that._destroyTouch();
                if (e.defaultPrevented || !that.options.useTouch || !that.allowTouch || !e.touches[0] || !that.allowedDragTarget(e.target)) {
                    return;
                }

                identifier = e.touches[0].identifier;

                that.allowMouse = false;
                that.isType = 'touch';

                that.element.addEventListener('touchmove', move, touchOpts);
                that.element.addEventListener('touchend', end, touchOpts);
                that.element.addEventListener('touchcancel', end, touchOpts);

                that.start(e.touches[0], e);
            };

            this.element.addEventListener('touchstart', this._ontouchstart, touchOpts);
        },
        setupPointer: function(){
            var identifier;
            var that = this;
            var options = this.options;
            var move = function (e) {
                if(e.pointerId == identifier){
                    that.move(e, e);
                }
            };

            var end = function (e) {

                if(e.pointerId == identifier) {
                    that.allowMouse = true;
                    that._destroyPointer();
                    that.end(e, e);
                }
            };

            this._destroyPointer = function () {
                identifier = undefined;
                document.removeEventListener('pointermove', move);
                document.removeEventListener('pointerup', end);
                document.removeEventListener('pointercancel', end);
            };

            this._pointerdown = this._pointerdown || function (e) {
                    if (identifier) {
                        return;
                    }

                    var isMouse = e.pointerType == 'mouse';

                    that._destroyPointer();

                    if (e.defaultPrevented || e.isPrimary === false || (isMouse && !options.useMouse) || e.button || !options.useTouch || !that.allowTouch || !that.allowedDragTarget(e.target)) {
                        return;
                    }

                    if(isMouse && !options.usePointerMouse){
                        if(options.useMouse && options.stopPropagation){
                            e.stopImmediatePropagation();
                        }
                        return;
                    }

                    if(e.target.nodeName != 'SELECT'){
                        e.preventDefault();
                    }

                    identifier = e.pointerId;

                    that.allowMouse = false;
                    that.isType = 'pointer';


                    document.addEventListener('pointermove', move);
                    document.addEventListener('pointerup', end);
                    document.addEventListener('pointercancel', end);

                    that.start(e, e);
                };

            this.element.addEventListener('pointerdown', this._pointerdown);
        },
        destroy: function () {
            clearInterval(this._velocityTimer);
            this.destroyed = true;

            if(this._ontouchstart){
                this.element.removeEventListener('touchstart', this._ontouchstart, touchOpts);
            }
            if(this._pointerdown){
                this.element.removeEventListener('pointerdown', this._pointerdown);
            }

            if(this._onmousedown){
                this.element.removeEventListener('mousedown', this._onmousedown);
            }

            this.element.removeEventListener('click', this._onclick, true);
            this.element.removeEventListener('selectstart', this._onSelectStart, true);
            this.setTouchAction();

            if(this.element._rbDraggy == this){
                delete this.element._rbDraggy;
            }
        },
    });

    rb.Draggy = Draggy;

    $.fn.draggy = function (options) {
        var draggy;
        this.each(function () {
            if (options == 'destroy') {
                if (this._rbDraggy) {
                    this._rbDraggy.destroy();
                }
            } else if (!this._rbDraggy) {
                this._rbDraggy = new Draggy(this, options || {});
            }
            if (!draggy) {
                draggy = this._rbDraggy;
            }
        });
        return draggy || this;
    };
})();
