import './itemscroller';
import '../utils/keyboardfocus';

const rb = window.rb;

class ItemScrollerPlayer extends rb.components.itemscroller {
    /**
     * @static
     * @mixes rb.components.itemscroller.defaults
     *
     * @property {Number} autoplayDelay=2000 Delay between autoplay next and current slide.
     * @property {Boolean} autoplay=false Activates autoplay/slide show.
     * @property {Boolean} pauseOnHover=true Pauses slide show on mouseenter.
     * @property {Boolean} jumpToStart=true In case of a non-carousel jumps to the first slide instead of sliding to the first slide.
     */
    static get defaults(){
        return {
            autoplay: false,
            autoplayDelay: 2000,
            pauseOnHover: true,
            jumpToStart: true,
        };
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this._setAutoplayUI = rb.rAF(function () {
            this.$element[this.options.autoplay ? 'addClass' : 'removeClass'](rb.statePrefix + 'autoplay');
        }, {that: this});
    }

    static get events(){
        return {
            'click:closest(.{name}{e}autoplay{-}btn)'() {
                this.setOption('autoplay', !this.options.autoplay);
            },
        };
    }

    setOption (name, value, isSticky) {
        super.setOption(name, value, isSticky);

        switch (name) {
            case 'autoplay':
                this[value ? 'startAutoplay' : 'stopAutoplay']();
                break;
            case 'autoplayDelay':
                if (this.options.autoplay) {
                    this.startAutoplay();
                }
                break;
        }
    }

    stopAutoplay () {
        clearInterval(this._autoplayTimer);
        if (this._onenterAutoplay) {
            this.$element.off('mouseenter', this._onenterAutoplay);
        }
        if (this._onleaveAutoplay) {
            this.$element.off('mouseleave', this._onleaveAutoplay);
        }

        if (!this.options.autoplay) {
            this._setAutoplayUI();
        }
    }

    startAutoplay() {
        var that = this;
        var options = this.options;
        var keyboardFocusSel = '.' + rb.utilPrefix + rb.nameSeparator + 'keyboardfocus';
        if (!options.autoplay) {
            return;
        }
        this.stopAutoplay();

        if (!this._onenterAutoplay) {
            this._onenterAutoplay = function () {
                if (options.pauseOnHover) {
                    clearInterval(that._autoplayTimer);
                }
            };
        }

        if (!this._onleaveAutoplay) {
            this._onleaveAutoplay = function () {
                if (options.pauseOnHover && options.autoplay) {
                    clearInterval(that._autoplayTimer);
                    that._autoplayTimer = setInterval(that._autoplayHandler, options.autoplayDelay);
                }
            };
        }

        if (!this._autoplayHandler) {
            this._autoplayHandler = function () {
                if(that.element.querySelector(keyboardFocusSel)){return;}
                if (that.isCarousel || that.selectedIndex + 1 < that.baseLength) {
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
    }

    attached () {
        if (this.options.autoplay) {
            this.startAutoplay();
        }
    }

    detached () {
        this.stopAutoplay();
    }
}

rb.live.register('itemscroller', ItemScrollerPlayer, true);

export default ItemScrollerPlayer;
