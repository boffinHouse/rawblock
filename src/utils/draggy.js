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
const hasIOSScrollBug = !supportsCssTouchActionPan && (/iphone|ipad/i).test(navigator.userAgent || '');

function Draggy(element, options) {

    this.element = element;
    this.options = Object.assign({}, Draggy._defaults, options);
    this.destroyed = false;

    this.noop = ()=>{};

    this.velocitySnapShot = this.velocitySnapShot.bind(this);

    rAFs(this, {throttle: true}, 'setTouchAction');

    this.touchOpts = this.options.usePassiveEventListener && supportsTouchAction ?
        {passive: true} :
        {passive: false}
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

    Draggy.constructs.forEach((construct) => {
        construct.call(this, this.element, this.options);
    });
}

Draggy._defaults = {
    move: noop,
    start: noop,
    end: noop,
    // set to false to allow only vertical drag
    horizontal: true,
    // set to true to allow only vertical drag
    vertical: true,
    // selector
    exclude: false,
    excludeNothing: false,
    //prevents mouse click, if a drag happend
    preventClick: true,
    //prevents touchMove events if currently dragging.
    preventMove: true,
    //allow drag by touch (includes pointer events)
    useTouch: true,
    //allow drag by mouse
    useMouse: true,
    //handle mouse events in pointer events, if false uses oldSchool mouseevents.
    usePointerMouse: false,
    // stops event propagation, improves nested drags
    stopPropagation: true,
    // uses passive event listener
    usePassiveEventListener: true,
    usePointerOnActive: false,
    // catches start also with with touchmove event instead of touchstart only.
    catchMove: false,
    handleDefaultPrevented: false,
    // velocityBase moved pixel in 333
    velocityBase: 333,
};

Draggy.constructs = [];
Draggy.extend = function(defaults, construct, proto){
    Draggy.constructs.push(construct);

    Object.entries(proto).forEach(([name, prop]) => {
        if(typeof Draggy.prototype[name] == 'function'){
            prop.superFn = Draggy.prototype[name];

            Draggy.prototype[name] = prop;

        } else {
            Draggy.prototype[name] = prop;
        }
    });

    Object.assign(Draggy._defaults, defaults);
};

Object.assign(Draggy.prototype, {
    setTouchAction(){
        const {usePointerOnActive, usePassiveEventListener} = this.options;

        if(!supportsTouchAction || (!usePassiveEventListener && (!usePointerOnActive || !supportsPointerWithoutTouch))){return;}

        let style = '';

        if(!this.destroyed){
            if(!this.options.horizontal){
                style = 'pan-x';
            } else if(!this.options.vertical){
                style = 'pan-y';
            } else {
                style = 'pan-x pan-y';
            }
        }

        this.element.style.touchAction = style;
    },
    hasRelevantChange() {
        const options = this.options;
        let ret = true;

        if (options.horizontal != options.vertical) {
            const dif = {
                horizontal: {
                    cur: Math.abs(this.curPos.x - this.lastPos.x),
                    abs: Math.abs(this.curPos.x - this.startPos.x)
                },
                vertical: {
                    cur: Math.abs(this.curPos.y - this.lastPos.y),
                    abs: Math.abs(this.curPos.y - this.startPos.y),
                },
            };
            const [testOrientation, oppositeOrientation] = options.horizontal ?
                ['horizontal', 'vertical'] :
                ['vertical', 'horizontal'];

            ret = dif[testOrientation].cur * 0.8 > dif[oppositeOrientation].cur ||
                (dif[testOrientation].cur < dif[testOrientation].abs &&
                dif[testOrientation].abs * 0.85 > dif[oppositeOrientation].abs);


            if (!ret && dif.horizontal.cur < 2 && dif.vertical.cur < 2 && dif.horizontal.abs < 9 && dif.vertical.abs < 9) {
                ret = 'undecided';
            }
        }

        return ret;
    },
    reset() {
        this.isType = '';
        this.technicalVelFactor = 1;
        this.isTechnicalType = '';
        this.startPos = {};
        this.lastPos = {};
        this.relPos = {};
        this.curPos = {};
        this.velTime = null;
        this.horizontalVel = 0;
        this.verticalVel = 0;
        this.allowClick = noop;
    },
    technicalVelFactor: 1,
    velocitySnapShot() {
        let velTiming;

        if (this.velTime) {
            velTiming = (Date.now() - this.velTime);

            if (velTiming > 80 || (!this.horizontalVel && !this.verticalVel)) {
                const {velocityBase} = this.options;

                velTiming = ((velTiming / velocityBase) || 1) * (1 / this.technicalVelFactor);

                this.velPos = this._velPos;

                this.horizontalVelDir = (this.curPos.x - this.velPos.x) / velTiming;
                this.verticalVelDir = (this.curPos.x - this.velPos.x) / velTiming;

                this.horizontalVel = Math.abs(this.horizontalVelDir) || 0.00000001;
                this.verticalVel = Math.abs(this.verticalVelDir) || 0.00000001;
            }
        }

        this._velPos = this.curPos;
        this.velTime = Date.now();
    },
    start(pos, evt) {
        const options = this.options;

        this.startPos = {
            x: 'draggyX' in pos ? pos.draggyX : pos.clientX,
            y: 'draggyY' in pos ? pos.draggyY :pos.clientY,
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
    move(pos, evt) {
        const options = this.options;

        this.lastPos = this.curPos;
        this.curPos = {
            x: 'draggyX' in pos ? pos.draggyX : pos.clientX,
            y: 'draggyY' in pos ? pos.draggyY :pos.clientY,
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

        this.movedPos.x = this.curPos.x - this.startPos.x;
        this.movedPos.y = this.curPos.y - this.startPos.y;
        this.relPos.x = this.curPos.x - this.lastPos.x;
        this.relPos.y = this.curPos.y - this.lastPos.y;

        options.move(this, evt);
    },
    end(pos, evt) {
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

        this.movedPos.x = this.curPos.x - this.startPos.x;
        this.movedPos.y = this.curPos.y - this.startPos.y;

        if(!('x' in this.relPos) && !('y' in this.lastPos)){
            this.lastPos = this.curPos;
            this.relPos.x = this.curPos.x - this.lastPos.x;
            this.relPos.y =  this.curPos.y - this.lastPos.y;
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
    preventClick(evt) {
        this.isClickPrevented = true;
        clearTimeout(this._preventClickTimer);

        this._preventClickTimer = setTimeout(()=> {
            this.isClickPrevented = false;
        }, 333);

        if (evt && evt.preventDefault && (!supportsPassiveEventListener || (evt.type != 'touchend' && evt.type != 'pointerup'))) {
            evt.preventDefault();
        }
    },
    setupEvents() {
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
    isAllowedForType(type){
        return (!this.isTechnicalType || this.isTechnicalType == type);
    },
    setupMouse() {
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
            clearTimeout(timer);
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
        };

        this._onmousedown = (e)=> {
            this._destroyMouse();
            const { handleDefaultPrevented, useMouse } = this.options;

            if ((e.defaultPrevented && !handleDefaultPrevented) || e.button || !useMouse || !this.isAllowedForType('mouse') || !this.allowedDragTarget(e.target)) {
                return;
            }

            if(e.target.nodeName != 'SELECT'){
                e.preventDefault();
            }

            this.isType = 'mouse';
            this.isTechnicalType = 'mouse';

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);

            this.start(e, e);
        };

        this.element.addEventListener('mousedown', this._onmousedown);
    },
    setupTouch() {
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

                if(hasIOSScrollBug){
                    window.removeEventListener('touchmove', this.noop, {passive: false});
                }
            };
        }

        if(!this._ontouchstart){
            this._ontouchstart = (e) => {
                if (e.touches.length != 1) {
                    return;
                }

                const { handleDefaultPrevented, useTouch } = this.options;

                this._destroyTouch();

                if ((e.defaultPrevented && !handleDefaultPrevented)|| !useTouch || !this.isAllowedForType('touch') || !e.touches[0] || !this.allowedDragTarget(e.target)) {
                    return;
                }

                identifier = e.touches[0].identifier;

                this.isType = 'touch';
                this.isTechnicalType = 'touch';

                this.element.addEventListener('touchmove', move, this.touchOpts);
                this.element.addEventListener('touchend', end, this.touchOpts);
                this.element.addEventListener('touchcancel', end, this.touchOpts);

                if(this.options.catchMove){
                    this.element.removeEventListener('touchmove', this._ontouchstart, this.touchOpts);
                }

                if(hasIOSScrollBug){
                    e.preventDefault();
                    window.addEventListener('touchmove', this.noop, {passive: false});
                }

                this.start(e.touches[0], e);
            };
        }

        this.element.addEventListener('touchstart', this._ontouchstart, this.touchOpts);

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
                const { handleDefaultPrevented, useTouch, useMouse } = this.options;

                that._destroyPointer();

                if ((e.defaultPrevented && !handleDefaultPrevented) || e.isPrimary === false || (isMouse && !useMouse) || e.button || !useTouch || !that.isAllowedForType('pointer') || !that.allowedDragTarget(e.target)) {
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

                that.isType = isMouse ? 'mouse' : 'touch';
                that.isTechnicalType = 'pointer';

                document.addEventListener('pointermove', move);
                document.addEventListener('pointerup', end);
                document.addEventListener('pointercancel', end);

                that.start(e, e);
            };

        this.element.addEventListener('pointerdown', this._pointerdown);
    },
    destroy() {
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
            window.removeEventListener('touchmove', this.noop, {passive: false});
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
