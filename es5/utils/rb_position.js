(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'babel-runtime/helpers/typeof'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('babel-runtime/helpers/typeof'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global._typeof);
        global.rb_position = mod.exports;
    }
})(this, function (module, _typeof2) {
    'use strict';

    var _typeof3 = _interopRequireDefault(_typeof2);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    (function (factory) {
        if ((typeof module === 'undefined' ? 'undefined' : (0, _typeof3.default)(module)) === 'object' && module.exports) {
            module.exports = factory();
        } else {
            factory();
        }
    })(function () {
        'use strict';
        /* jshint eqnull: true */

        var rb = window.rb;
        var $ = rb.$;

        var Position = function Position(element, options) {

            if (element[Position.expando]) {
                this.log('is already positioned');
                return element[Position.expando];
            }
            if (!(this instanceof Position)) {
                return new Position(element, options);
            }

            this.element = element;
            this.$element = $(element);
            this.elemCstyle = rb.getStyles(this.element);

            this.position = rb.rAF(this._position, { that: this });
            this.options = {};

            this.pos = {
                top: 0,
                left: 0
            };
            this.flipped = {
                x: '',
                y: ''
            };

            this.flippedXClass = 'is' + rb.nameSeparator + 'flipped' + rb.nameSeparator + 'x';
            this.flippedYClass = 'is' + rb.nameSeparator + 'flipped' + rb.nameSeparator + 'y';

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
            regWhite: /\s+/g,
            expando: rb.Symbol('_rbPosition'),
            labels: {
                top: '0',
                left: '0',
                center: '50',
                middle: '50',
                right: '100',
                bottom: '100'
            },
            isHorizontal: {
                left: 1,
                right: 1
            },
            margins: ['marginTop', 'marginLeft', 'marginBottom', 'marginRight'],
            posType: {
                top: {
                    dim: 'height',
                    rootDim: 'clientHeight',
                    margins: ['marginTop', 'marginBottom'],
                    axisIndex: 1,
                    axis: 'y'
                },
                left: {
                    dim: 'width',
                    rootDim: 'clientWidth',
                    margins: ['marginLeft', 'marginRight'],
                    axisIndex: 0,
                    axis: 'x'
                }
            }
        });

        Object.assign(Position.prototype, {
            _position: function _position(element, props) {
                var prop, value;
                var style = element.style;
                for (prop in props) {
                    value = props[prop];
                    if (typeof value == 'number') {
                        value = value + 'px';
                    }
                    style[prop] = value;
                }

                this.element.classList[this.flipped.x ? 'add' : 'remove'](this.flippedXClass);
                this.element.classList[this.flipped.y ? 'add' : 'remove'](this.flippedYClass);
            },
            parsePosOption: function parsePosOption(str, number) {
                var i;
                str = str.split(Position.regWhite);

                if (!str[1]) {
                    str[1] = str[0];
                }

                if (Position.isHorizontal[str[1]]) {
                    this.log('use horizontal position values before vertical ones: "left top", instead of "top left"');
                }

                for (i = 0; i < 2; i++) {

                    if (str[i] in Position.labels) {
                        str[i] = Position.labels[str[i]];
                    }
                    if (number) {
                        str[i] = parseFloat(str[i]) || 0;
                    }
                }

                return str;
            },
            setOptions: function setOptions(options) {
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

                if (my !== this.options.my) {
                    this.my = this.parsePosOption(this.options.my, 1);
                }
                if (at !== this.options.at) {
                    this.at = this.parsePosOption(this.options.at, 1);
                }
                if (collision !== this.options.collision) {
                    this.collision = this.parsePosOption(this.options.collision);
                }

                return this;
            },
            getBoxLayout: function getBoxLayout(element, offset, useMargin) {
                var i, styles;
                var box = element.getBoundingClientRect();
                box = {
                    top: box.top,
                    left: box.left,
                    height: box.height,
                    width: box.width
                };

                if (useMargin) {
                    styles = rb.getStyles(element);
                    for (i = 0; i < 4; i++) {
                        box[Position.margins[i]] = $.css(element, Position.margins[i], true, styles);
                    }
                }

                return box;
            },
            addOffset: function addOffset(posType, box, offset, useMargin) {
                var marginIndex;
                var props = Position.posType[posType];

                var ret = box[posType] + box[props.dim] * (offset[props.axisIndex] / 100);

                if (useMargin && (offset[props.axisIndex] < 25 || offset[props.axisIndex] > 75)) {
                    marginIndex = offset[props.axisIndex] < 50 ? 0 : 1;
                    if (marginIndex == 1) {
                        ret += box[props.margins[marginIndex]];
                    } else {
                        ret -= box[props.margins[marginIndex]];
                    }
                }

                return ret;
            },
            calculatePosition: function calculatePosition(posType, targetBox, elementBox, targetOffset, elementOffset, computedPosition) {
                var rootDim, rootPos, isOut1, isOut2, targetOffset2, elementOffset2;
                var props = Position.posType[posType];
                var position = this.addOffset(posType, targetBox, targetOffset) - this.addOffset(posType, elementBox, elementOffset, true) + this.pos[posType];

                if (this.collision[props.axisIndex] == 'flip') {
                    rootDim = rb.root[props.rootDim];
                    rootPos = elementBox[posType] + (position - this.pos[posType]);
                    isOut1 = rootPos < 0;
                    isOut2 = rootPos + elementBox[props.dim] > rootDim;

                    if (isOut1 || isOut2) {
                        this.flipped[props.axis] = true;
                        if (computedPosition != null) {
                            this.flipped[props.axis] = false;
                            position = computedPosition;
                        } else if (isOut1 && elementOffset[props.axisIndex] > 50 && targetOffset[props.axisIndex] <= 50 || isOut2 && elementOffset[props.axisIndex] < 50 && targetOffset[props.axisIndex] >= 50) {
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
            connect: function connect(target, immediate) {
                var pos, targetBox, elementBox;
                var options = this.options;

                this.pos.top = $.css(this.element, 'top', 1, this.elemCstyle);
                this.pos.left = $.css(this.element, 'left', 1, this.elemCstyle);
                this.flipped.x = false;
                this.flipped.y = false;

                if (typeof this.pos.top != 'number') {
                    this.pos.top = 0;
                    this.element.style.top = '0px';
                }
                if (typeof this.pos.left != 'number') {
                    this.pos.left = 0;
                    this.element.style.left = '0px';
                }

                targetBox = this.getBoxLayout(target || options.anchor, this.at);
                elementBox = this.getBoxLayout(this.element, this.my, true);

                pos = {
                    top: this.calculatePosition('top', targetBox, elementBox, this.at, this.my),
                    left: this.calculatePosition('left', targetBox, elementBox, this.at, this.my)
                };

                this.pos.top = pos.top;
                this.pos.left = pos.left;

                if (immediate && this.options.using._rbUnrafedFn) {
                    this.options.using._rbUnrafedFn.call(this, this.element, this.pos);
                } else {
                    this.options.using.call(this, this.element, this.pos, this.flipped);
                }
                return this;
            }
        });

        rb.Position = Position;

        return Position;
    });
});
