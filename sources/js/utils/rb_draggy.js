(function () {
    'use strict';
    var rb = window.rb;
    var $ = rb.$;

    var regInputs = /^(?:input|select|textarea|button)$/i;

    function Draggy(element, options) {

        this.element = element;
        this.options = Object.assign({}, Draggy._defaults, options);

        this._velDelay = 333;

        this.velocitySnapShot = this.velocitySnapShot.bind(this);

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

            clearInterval(this._velocityTimer);
            this._velocityTimer = setInterval(this.velocitySnapShot, this._velDelay);
            this.velocitySnapShot();

            this.options.start(this);
        },
        move: function (pos, evt) {
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

            if (this.options.preventMove && this.relevantChange != 'undecided') {
                evt.preventDefault();
            }
            this.movedPos.x = this.startPos.x - this.curPos.x;
            this.movedPos.y = this.startPos.y - this.curPos.y;
            this.relPos.x = this.lastPos.x - this.curPos.x;
            this.relPos.y = this.lastPos.y - this.curPos.y;

            this.options.move(this);
        },
        end: function (pos, evt) {
            var preventClick = this.options.preventClick;
            clearInterval(this._velocityTimer);
            this.velocitySnapShot();

            this.allowClick = function () {
                preventClick = false;
            };
            this._destroyTouch();
            this._destroyMouse();
            this.movedPos.x = this.startPos.x - this.curPos.x;
            this.movedPos.y = this.startPos.y - this.curPos.y;
            this.options.end(this);

            if (preventClick && (Math.abs(this.lastPos.x - this.startPos.x) > 15 || Math.abs(this.lastPos.y - this.startPos.y) > 15)) {
                this.preventClick(evt);
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
            if (evt && evt.preventDefault) {
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
            this.element.addEventListener('click', this._onclick, true);
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
                if (e.defaultPrevented || !that.options.useMouse || !that.allowMouse || regInputs.test(e.target.nodeName || '')) {
                    return;
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
            var that = this;

            var move = function (e) {
                that.move((e.changedTouches || e.touches)[0], e);
            };

            var end = function (e) {
                that.allowMouse = true;
                that._destroyTouch();
                that.end((e.changedTouches || e.touches)[0], e);
            };

            this._destroyTouch = function () {
                that.element.removeEventListener('touchmove', move);
                that.element.removeEventListener('touchend', end);
            };

            this._ontouchstart = function (e) {
                if (e.touches.length != 1) {
                    return;
                }
                that._destroyTouch();
                if (e.defaultPrevented || !that.options.useTouch || !that.allowTouch || !e.touches[0] || regInputs.test(e.touches[0].target.nodeName || '')) {
                    return;
                }
                that.allowMouse = false;
                that.isType = 'touch';

                that.element.addEventListener('touchmove', move);
                that.element.addEventListener('touchend', end);

                that.start(e.touches[0], e);
            };

            this.element.addEventListener('touchstart', this._ontouchstart);
        },
        destroy: function () {
            clearInterval(this._velocityTimer);
            this.element.removeEventListener('touchstart', this._ontouchstart);
            this.element.removeEventListener('mousedown', this._onmousedown);
            this.element.removeEventListener('click', this._onclick, true);
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
