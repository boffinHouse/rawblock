import cssSupports from './css-supports';
import getId from './get-id';
import {rAFs} from './rafs';

const rb = window.rb || {};
const $ = rb.$;
const noop = ()=> {};
const btnsMap = {
    image: 1,
    file: 1,
    button: 1,
    submit: 1,
};

const regInputs = /^(?:input|textarea)$/i;
const supportsPointerWithoutTouch = window.PointerEvent && (!window.TouchEvent || !window.Touch || !window.TouchList);
const supportsCssTouchActionPan = cssSupports('(touch-action: pan-y)') && cssSupports('(touch-action: none)');
const supportsPassiveEventListener = !supportsPointerWithoutTouch && supportsCssTouchActionPan && (function(){
        let supportsPassiveOption = false;
        const id = 'test' + getId();

        try {
            const opts = Object.defineProperty({}, 'passive', {
                get: function() {
                    supportsPassiveOption = true;
                },
            });

            window.addEventListener(id, noop, opts);
            window.removeEventListener(id, noop, opts);
        } catch (e) {} // eslint-disable-line no-empty

        return supportsPassiveOption;
    })();
const supportsTouchAction = supportsPassiveEventListener || supportsPointerWithoutTouch;
const hasIOSScrollBug = (function () {
    const ua = navigator.userAgent || '';
    const version = !supportsCssTouchActionPan && /Safari\/60\d\./.test(ua) && /Version\/10\.(\d+)/.exec(ua);

    return (version && parseInt(version[1], 10) < 3);
})();

function Draggy(element, options) {

    this.element = element;
    this.options = Object.assign({}, Draggy._defaults, options);
    this.destroyed = false;

    this.noop = ()=>{};

    this.velocitySnapShot = this.velocitySnapShot.bind(this);

    rAFs(this, {throttle: true}, 'setTouchAction');

    this.touchOpts = this.options.usePassiveEventListener && supportsTouchAction ?
        {passive: true} :
        false
    ;

    this.reset();

    this.setupEvents();
    this.setTouchAction();

    if(this.options.useMouse){
        this.setupMouse();
    }

    if(this.options.useTouch){
        if(supportsPointerWithoutTouch){
            this.setupPointer();
        } else {
            this.setupTouch();
        }
    }
}

Draggy._defaults = {
    move: noop,
    start: noop,
    end: noop,
    preventClick: true,
    preventMove: true,
    useMouse: true,
    useTouch: true,
    usePointerMouse: false,
    horizontal: true,
    vertical: true,
    exclude: false,
    excludeNothing: false,
    stopPropagation: true,
    usePassiveEventListener: true,
    usePointerOnActive: false,
    catchMove: false,
    velocityBase: 333,
};

Object.assign(Draggy.prototype, {
    setTouchAction: function(){
        const {usePointerOnActive, usePassiveEventListener} = this.options;

        if(!supportsTouchAction || (!usePassiveEventListener && (!usePointerOnActive || !supportsPointerWithoutTouch))){return;}

        let style = '';

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
        let horizontalDif, verticalDif;
        const options = this.options;
        let ret = true;

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
        this.allowClick = noop;
    },
    velocitySnapShot: function () {
        let velTiming;

        if (this.velTime) {
            velTiming = (Date.now() - this.velTime);

            if (velTiming > 85 || (!this.horizontalVel && !this.verticalVel)) {
                const {velocityBase} = this.options;

                velTiming = (velTiming / velocityBase) || 1;

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
        const options = this.options;

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
        this._velocityTimer = setInterval(this.velocitySnapShot, 200);
        this.velocitySnapShot();

        options.start(this, evt);
    },
    move: function (pos, evt) {
        const options = this.options;

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

        if (options.preventMove && this.relevantChange != 'undecided' && !supportsPassiveEventListener) {
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
        const options = this.options;
        let preventClick = options.preventClick;

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

        if(!('x' in this.relPos) && !('y' in this.lastPos)){
            this.lastPos = this.curPos;
            this.relPos.x = this.lastPos.x - this.curPos.x;
            this.relPos.y = this.lastPos.y - this.curPos.y;
        }

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
        this.isClickPrevented = true;
        clearTimeout(this._preventClickTimer);

        this._preventClickTimer = setTimeout(()=> {
            this.isClickPrevented = false;
        }, 333);

        if (evt && evt.preventDefault && (!supportsPassiveEventListener || (evt.type != 'touchend' && evt.type != 'pointerup'))) {
            evt.preventDefault();
        }
    },
    setupEvents: function () {
        const that = this;

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
        const {excludeNothing, exclude} = this.options;
        return excludeNothing ||
            (btnsMap[target.type] || !regInputs.test(target.nodeName || '') && (!exclude || !target.closest(exclude)));
    },
    setupMouse: function () {
        let timer;

        const move = (e)=> {
            if (!e.buttons && !e.which) {
                up(e);
                this._destroyMouse();
                return;
            }
            this.move(e, e);
        };

        const up = (e)=> {
            this._destroyMouse();
            this.end(e, e);
        };

        this._destroyMouse = ()=> {
            this.allowTouch = true;
            clearTimeout(timer);
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
        };

        this._onmousedown = (e)=> {
            this._destroyMouse();
            if (e.defaultPrevented || e.button || !this.options.useMouse || !this.allowMouse || !this.allowedDragTarget(e.target)) {
                return;
            }

            if(e.target.nodeName != 'SELECT'){
                e.preventDefault();
            }

            this.allowTouch = false;
            this.isType = 'mouse';

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);

            this.start(e, e);
        };

        this.element.addEventListener('mousedown', this._onmousedown);
    },
    setupTouch: function () {
        let identifier;
        const getTouch = function(touches){
            let i, len, touch;

            for(i = 0, len = touches.length; i < len; i++){
                if(touches[i].identifier == identifier){
                    touch = touches[i];
                    break;
                }
            }

            return touch;
        };

        const move = (e)=> {
            let touch = getTouch(e.changedTouches || e.touches);

            if(touch){
                this.move(touch, e);
            }
        };

        const end = (e)=> {
            const touch = getTouch(e.changedTouches || e.touches);

            if(touch) {
                this.allowMouse = true;
                this._destroyTouch();
                this.end(touch, e);

                if(this.options.catchMove){
                    this.element.addEventListener('touchmove', this._ontouchstart, this.touchOpts);
                }

                identifier = undefined;
            }
        };

        if(!this._destroyTouch){
            this._destroyTouch = () => {
                this.element.removeEventListener('touchmove', move, this.touchOpts);
                this.element.removeEventListener('touchend', end, this.touchOpts);
                this.element.removeEventListener('touchcancel', end, this.touchOpts);
            };
        }

        if(!this._ontouchstart){
            this._ontouchstart = (e) => {
                if (e.touches.length != 1) {
                    return;
                }

                this._destroyTouch();

                if (e.defaultPrevented || !this.options.useTouch || !this.allowTouch || !e.touches[0] || !this.allowedDragTarget(e.target)) {
                    return;
                }

                identifier = e.touches[0].identifier;

                this.allowMouse = false;
                this.isType = 'touch';

                this.element.addEventListener('touchmove', move, this.touchOpts);
                this.element.addEventListener('touchend', end, this.touchOpts);
                this.element.addEventListener('touchcancel', end, this.touchOpts);

                if(this.options.catchMove){
                    this.element.removeEventListener('touchmove', this._ontouchstart, this.touchOpts);
                }

                this.start(e.touches[0], e);
            };
        }

        this.element.addEventListener('touchstart', this._ontouchstart, this.touchOpts);

        if(hasIOSScrollBug){
            window.addEventListener('touchmove', this.noop);
        }

        if(this.options.catchMove){
            this.element.addEventListener('touchmove', this._ontouchstart, this.touchOpts);
        }
    },
    setupPointer: function(){
        let identifier;
        const that = this;
        const options = this.options;

        const move = (e)=> {
            if(e.pointerId == identifier){
                this.move(e, e);
            }
        };

        const end = (e)=> {

            if(e.pointerId == identifier) {
                this.allowMouse = true;
                this._destroyPointer();
                this.end(e, e);
            }
        };

        this._destroyPointer = ()=> {
            identifier = undefined;
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', end);
            document.removeEventListener('pointercancel', end);
        };

        this._pointerdown = this._pointerdown || function (e) {
                if (identifier) {
                    return;
                }

                const isMouse = e.pointerType == 'mouse';

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
            this.element.removeEventListener('touchstart', this._ontouchstart, this.touchOpts);
        }
        if(this._pointerdown){
            this.element.removeEventListener('pointerdown', this._pointerdown);
        }

        if(this._onmousedown){
            this.element.removeEventListener('mousedown', this._onmousedown);
        }

        if(hasIOSScrollBug){
            window.removeEventListener('touchmove', this.noop);
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

if($ && $.fn){
    $.fn.draggy = function (options) {
        let draggy;

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
}

export default Draggy;
