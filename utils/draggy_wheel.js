import Draggy from './draggy';
import wheelintent from './wheelintent';
import WheelAnalyzr from './wheelanalyzer';
import debounce from './debounce';

Draggy.extend(
    {
        useWheel: false,
    },
    function (element, options) {
        if(!options.useWheel){
            return;
        }

        this._wheelReset();

        ['wheelEnded', 'wheelHandler'].forEach((fn) => {
            this[fn] = this[fn].bind(this);
        });

        this.debouncedWheelEnded = debounce(this.wheelEnded, {delay: 99});
        this.wheelDirEnded = debounce(this.wheelDirEnded, {delay: 88});

        this.wheelAnalyzr = new WheelAnalyzr();

        wheelintent.add(element, this.wheelHandler);

        this.wheelAnalyzr
            .subscribe('interrupted', this.wheelEnded)
            .subscribe('ended', this.wheelEnded)
            .subscribe('recognized', this.wheelEnded)
        ;
    },
    {
        transformWheelEvent({clientX, clientY, pageX, pageY, deltaX, deltaY}){
            return {
                draggyX: this.wheelPageX,
                draggyY: this.wheelPageY,
                pageX,
                pageY,
                clientX,
                clientY,
                deltaX,
                deltaY,
            };
        },
        wheelEnded(){
            if(!this.isWheelEnded && this.isWheelStarted){
                const e = this.lastWheelEvent;

                this.isWheelEnded = true;
                this.end(this.transformWheelEvent(e), e);
            }
        },
        wheelDirEnded(){
            this._wheelReset();
        },
        isAllowedWheelDir(e){

            if(this._isAllowedWheelDir == 'undecided'){

                const {horizontal, vertical} = this.options;

                if(horizontal && vertical){
                    this._isAllowedWheelDir = true;
                } else {
                    let x = Math.abs(e[vertical ? 'deltaY' : 'deltaX']);
                    let y = Math.abs(e[vertical ? 'deltaX' : 'deltaY']);

                    if(x != y){
                        this._isAllowedWheelDir = x > y;
                    }
                }
            }

            if(!this._isAllowedWheelDir){
                this.wheelDirEnded();
            }

            return this._isAllowedWheelDir;
        },
        wheelHandler(e){
            if(e.deltaMode !== 0 || !this.isAllowedForType('wheel') || !this.isAllowedWheelDir(e)){return;}

            this.lastWheelEvent = e;
            e.preventDefault();

            this.wheelAnalyzr.feedWheel(e);
            this.debouncedWheelEnded();

            if(this.wheelAnalyzr.isMomentum){
                if(!this.isWheelEnded && this.isWheelStarted){
                    this.wheelEnded();
                }
                return;
            }

            this.wheelPageX -= e.deltaX;
            this.wheelPageY  -= e.deltaY;

            if(!this.isWheelStarted){
                this.isWheelStarted = true;
                this.isType = 'wheel';
                this.isTechnicalType = 'wheel';
                this.technicalVelFactor = 1.3;

                this.start(this.transformWheelEvent(e), e);
            } else {
                this.move(this.transformWheelEvent(e), e);
            }
        },

        _wheelReset(){
            this.isWheelStarted = false;
            this.isWheelEnded = false;
            this.isWheelStarted = false;
            this._isAllowedWheelDir = 'undecided';
            this.wheelPageX = 0;
            this.wheelPageY = 0;
        },

        reset: function reset() {
            const ret = reset.superFn.apply(this, arguments);
            this._wheelReset();
            return ret;
        },
    }
);

export default Draggy;
