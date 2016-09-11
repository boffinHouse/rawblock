(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';

    var rb = window.rb;
    var $ = rb.$;

    var _ChildFX = rb.Component.extend('_childfx',
        /** @lends rb.components._childfx.prototype */
        {
            /**
             * @prop {{}} defaults
             * @prop {Boolean} defaults.switchedOff=false Switches the component off.
             * @prop {String} defaults.childSel='find(.child{e}fx)' Child elements that should be animated. String is processed by rb.elementFromStr.
             */
            defaults: {
                switchedOff: false,
                childSel: 'find(.{name}{e}fx)',
            },
            statics: {
                toNumber: function (i) {
                    return parseFloat(i) || 0;
                },
                regNumber: /(-*\d+[\.\d]*)/g,
                regWhite: /\s/g,
            },
            /**
             * @constructs
             *
             * @classdesc Abstract class that can be extended to animate child elements according to a progress property.
             * @extends rb.Component
             *
             * @param element
             *
             * @example
             * <style type="sass">
             *     .rb-main {
			 *          .child-fx {
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
             * <div class="rb-main js-rb-live" data-module="childfxExtension">
             *     <img class="logo" src="..." />
             * </div>
             *
             * <script>
             * rb.components._childfx.extend('childfxExtension', {
			 *      init: function(element, initialDefaults){
			 *          this._super(element, initialDefaults);
			 *          this.pos();
			 *      },
			 *      pos: function(){
			 *          this.progress = 0.4; //set number between 0 - 1.
			 *          this.updateChilds();
			 *      }
			 * });
             * </script>
             */
            init: function (element, initialDefaults) {
                this._super(element, initialDefaults);

                this.progress = -2;
                this.updateChilds = rb.rAF(this.updateChilds);
            },
            getCssValue: function (elem, prop, options, styles) {
                var value = {};
                var endValue = options.end[prop];
                if (typeof endValue == 'object') {

                    Object.assign(value, endValue);
                    options.end[prop] = endValue.value || 0;

                    if ('start' in endValue) {
                        value.value = endValue.start;
                    }
                }

                value.value = value.value != null ? value.value : $.css(elem, prop, 1, styles);

                if (typeof value.value == 'string' && typeof options.end[prop] == 'string') {
                    value.template = value.value;
                    value.value = (value.value.match(_ChildFX.regNumber) || [0]).map(_ChildFX.toNumber);
                    options.end[prop] = (options.end[prop].match(_ChildFX.regNumber) || [0]).map(_ChildFX.toNumber);
                }
                return value;
            },
            setupChilds: function () {
                var that = this;
                this.childs = this.getElementsByString(this.options.childSel, this.element);
                this.childAnimations = this.childs.map(function (elem) {
                    var prop;
                    var styles = rb.getStyles(elem);

                    var options = {
                        start: {},
                        end: Object.assign({}, rb.parsePseudo(elem), rb.parseDataAttrs(elem)),
                        from: 0,
                        to: 1,
                    };

                    for (prop in options.end) {
                        if (prop == 'easing') {
                            options.easing = rb.addEasing(options.end[prop]);
                        } else if (prop == 'from' || prop == 'to') {
                            options[prop] = options.end[prop];
                        } else {
                            options.start[prop] = that.getCssValue(elem, prop, options, styles);
                        }
                    }
                    return options;
                });
            },
            checkChildReflow: function () {
                var ret = false;

                if (this.childs && this.childs.length && !this.options.switchedOff) {
                    this.childs.forEach(function (elem) {
                        if (!ret && rb.hasPseudoChanged(elem)) {
                            ret = true;
                        }
                    });
                }

                if (ret) {
                    this.updateChilds._rbUnrafedFn.call(this, true);
                    this.progress = -2;
                }

                return ret;
            },
            updateChilds: function (empty) {
                var eased, i, len, animOptions, elem, eStyle, prop, value, option, isString, i2, retFn, progress;
                empty = empty === true;

                if (!this.childs || !this.childAnimations) {
                    if (empty) {
                        return;
                    }
                    this.setupChilds();
                }

                for (i = 0, len = this.childs.length; i < len; i++) {
                    elem = this.childs[i];
                    animOptions = this.childAnimations[i];
                    progress = this.progress;
                    eStyle = elem.style;

                    if (!empty) {
                        if (animOptions.from > progress) {
                            progress = 0;
                        } else if (animOptions.to < progress) {
                            progress = 1;
                        } else if (animOptions.to < 1 || animOptions.from > 0) {
                            progress -= animOptions.from;
                            progress *= 1 / (1 - (1 - animOptions.to) - animOptions.from);
                        }

                        eased = animOptions.easing ?
                            animOptions.easing(progress) :
                            progress
                        ;
                    }

                    for (prop in animOptions.start) {
                        option = animOptions.start[prop];
                        value = option.value;

                        if (!empty) {
                            if ((isString = option.template)) {
                                i2 = 0;
                                if (!retFn) {
                                    /*jshint loopfunc: true */
                                    retFn = function () {
                                        var value = (animOptions.end[prop][i2] - option.value[i2]) * eased + option.value[i2];
                                        i2++;
                                        if (prop == 'backgroundColor') {
                                            value = Math.round(value);
                                        }
                                        return value;
                                    };
                                }
                                value = option.template.replace(_ChildFX.regNumber, retFn);
                            } else {
                                value = (animOptions.end[prop] - option.value) * eased + option.value;
                            }
                        }

                        if (prop in eStyle) {
                            if (!isString && !$.cssNumber[prop]) {
                                value += 'px';
                            }
                            eStyle[prop] = empty ? '' : value;
                        } else {
                            elem[prop] = value;
                        }
                    }
                }
                if (empty) {
                    this.childs = null;
                    this.childAnimations = null;
                }
            },
        }
    );

    return _ChildFX;
}));
