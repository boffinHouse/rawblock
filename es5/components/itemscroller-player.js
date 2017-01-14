(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './itemscroller', '../utils/keyboardfocus'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./itemscroller'), require('../utils/keyboardfocus'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.itemscroller, global.keyboardfocus);
        global.itemscrollerPlayer = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var rb = window.rb;

    var ItemScrollerPlayer = function (_rb$components$itemsc) {
        _inherits(ItemScrollerPlayer, _rb$components$itemsc);

        _createClass(ItemScrollerPlayer, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    autoplay: false,
                    autoplayDelay: 2000,
                    pauseOnHover: true,
                    jumpToStart: true
                };
            }
        }]);

        function ItemScrollerPlayer(element, initialDefaults) {
            _classCallCheck(this, ItemScrollerPlayer);

            var _this = _possibleConstructorReturn(this, _rb$components$itemsc.call(this, element, initialDefaults));

            _this._setAutoplayUI = rb.rAF(function () {
                this.$element[this.options.autoplay ? 'addClass' : 'removeClass'](rb.statePrefix + 'autoplay');
            }, { that: _this });
            return _this;
        }

        ItemScrollerPlayer.prototype.setOption = function setOption(name, value, isSticky) {
            _rb$components$itemsc.prototype.setOption.call(this, name, value, isSticky);

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
        };

        ItemScrollerPlayer.prototype.stopAutoplay = function stopAutoplay() {
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
        };

        ItemScrollerPlayer.prototype.startAutoplay = function startAutoplay() {
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
                    if (that.element.querySelector(keyboardFocusSel)) {
                        return;
                    }
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
        };

        ItemScrollerPlayer.prototype.attached = function attached() {
            if (this.options.autoplay) {
                this.startAutoplay();
            }
        };

        ItemScrollerPlayer.prototype.detached = function detached() {
            this.stopAutoplay();
        };

        _createClass(ItemScrollerPlayer, null, [{
            key: 'events',
            get: function get() {
                return {
                    'click:closest(.{name}{e}autoplay{-}btn)': function clickClosestNameEAutoplayBtn() {
                        this.setOption('autoplay', !this.options.autoplay);
                    }
                };
            }
        }]);

        return ItemScrollerPlayer;
    }(rb.components.itemscroller);

    rb.live.register('itemscroller', ItemScrollerPlayer, true);

    exports.default = ItemScrollerPlayer;
});
