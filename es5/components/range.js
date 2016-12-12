(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '../utils/rb_draggy'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('../utils/rb_draggy'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.rb_draggy);
        global.range = mod.exports;
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
    var $ = rb.$;

    if (!rb.i18n) {
        rb.i18n = {};
    }

    /**
     * Creates a range input control with one are more thumbs.
     *
     * @alias rb.component.range
     *
     * @extends rb.Component
     * @fires componentName#changed
     *
     *
     * @prop {Number[]} values Returns current values of the range control
     * @prop {$.CallbackObject} oninput
     * @prop {$.CallbackObject} oninput.add Adds a callback function.
     * @prop {$.CallbackObject} oninput.remove Removes a callback function.
     *
     *
     * @param element
     * @param initialDefaults
     *
     * @example
     * <div class="rb-range js-rb-live" data-module="range" data-values="[0, 100]"></div>
     *
     * <!-- combined with visible input -->
     * <label for="range-1">range</label>
     * <input value="10" min="1" max="10" type="number" id="range-1" />
     * <div class="rb-range js-rb-live" data-module="range" data-inputs="range-1"></div>
     *
     * @example
     *
     * rb.$('.rb-range').rbComponent().oninput.add(function(index){
     *      console.log('value changing', this.getValues(index));
     * });
     *
     * rb.$('.rb-range').on('rangechanged', function(){
     *      console.log('values changed', rb.$(this).rbComponent().getValues());
     * });
     */

    var Range = function (_rb$Component) {
        _inherits(Range, _rb$Component);

        _createClass(Range, null, [{
            key: 'defaults',
            get: function get() {
                return {
                    animate: true,
                    axis: 'auto',
                    inputs: 'find(input)',
                    values: 50,
                    step: 1,
                    max: 100,
                    min: 0,
                    titles: null,
                    labelIds: null,
                    labels: null
                };
            }
        }]);

        function Range(element, initialDefaults) {
            _classCallCheck(this, Range);

            var _this = _possibleConstructorReturn(this, _rb$Component.call(this, element, initialDefaults));

            _this.pos = [];

            _this._origin = 'component';

            _this.oninput = $.Callbacks();

            _this.rAFs({ batch: true }, '_setThumbValues', '_setInputValues');
            _this.rAFs('_setActivateClass', '_setAnimateClass', '_generateMarkup', '_updateMinMax');

            _this.oninput.fireWith = rb.rAF(_this.oninput.fireWith);

            _this._updateOptions = rb.throttle(function () {
                this.updateInputData();
                this._setThumbValues();
                this._updateMinMax();
            }, { simple: true, delay: 0 });

            _this._detectAxis();
            _this._getOptionsByInputs();
            _this._generateMarkup();
            return _this;
        }

        Range.prototype.setOption = function setOption(name, value, isSticky) {
            _rb$Component.prototype.setOption.call(this, name, value, isSticky);

            if (name == 'max' || name == 'min' || name == 'step') {
                this._updateOptions();
            } else if (name == 'inputs') {
                this._getOptionsByInputs();
                this._generateMarkup();
            }
        };

        Range.prototype.getValues = function getValues(index) {
            return index == null ? this.values : this.values[index];
        };

        Range.prototype.setValue = function setValue(value, index, animate) {
            if (typeof index == 'boolean') {
                animate = index;
                index = 0;
            }
            if (animate == null) {
                animate = this.options.animate;
            }
            index = index || 0;
            this._origin = 'external';
            this._setValue(this.constrainMinMax(value), index, animate);
            this.trigger({ origin: 'external', index: index });
            this._origin = 'component';
        };

        Range.prototype.stepUp = function stepUp(factor, index, animate) {
            if (typeof index == 'boolean') {
                animate = index;
                index = 0;
            }
            if (!index) {
                index = 0;
            }

            this._origin = 'external';
            this._doStep(factor, index, animate);
            this.trigger({ origin: 'external', index: index });
            this._origin = 'component';
        };

        Range.prototype.stepDown = function stepDown(factor, index, animate) {
            if (!factor) {
                factor = 1;
            }
            this.stepUp(factor * -1, index, animate);
        };

        Range.prototype.parseNumber = function parseNumber(string) {
            if (typeof string != 'number') {
                if (rb.i18n.formatNumber) {
                    string = rb.i18n.parseNumber.apply(rb.i18n, arguments);
                } else {
                    string = parseFloat(string);
                }
            }
            return string;
        };

        Range.prototype.formatNumber = function formatNumber(number) {
            if (rb.i18n.formatNumber) {
                number = rb.i18n.formatNumber.apply(rb.i18n, arguments);
            } else if (typeof number != 'string') {
                number = number + '';
            }
            return number;
        };

        Range.prototype.constrainMinMax = function constrainMinMax(value) {
            var valModStep = void 0,
                alignValue = void 0;

            var step = this.options.step;

            if (value > this.max) {
                value = this.max;
            } else if (value < this.min) {
                value = this.min;
            } else if (this.options.step != 'any') {
                valModStep = (value - this.min) % step;
                alignValue = value - valModStep;

                if (Math.abs(valModStep) * 2 >= step) {
                    alignValue += valModStep > 0 ? step : -step;
                }
                value = alignValue.toFixed(5) * 1;
            }
            return value;
        };

        Range.prototype.posToValue = function posToValue(pos) {
            var value = (this.max - this.min) * (pos / 100) + this.min;
            value = this.constrainMinMax(value);
            return value;
        };

        Range.prototype.valueToPos = function valueToPos(value) {
            var pos = void 0;

            value = this.constrainMinMax(this.parseNumber(value));
            pos = 100 * ((value - this.min) / (this.max - this.min));
            return pos;
        };

        Range.prototype.updateInputData = function updateInputData() {
            var options = this.options;

            this.max = null;
            this.min = null;
            this.step = null;

            if (this.inputs.length) {
                this._parseInputsProperties();
            }

            if (this.max == null) {
                this.max = options.max;
            }

            if (this.min == null) {
                this.min = options.min;
            }

            if (this.step == null) {
                this.step = options.min;
            }

            if (!this.values.length) {
                this.values = Range.makeArray(options.values);
            }

            this._clacSteps();
        };

        Range.prototype._generateMarkup = function _generateMarkup() {
            var $progress = void 0,
                list = void 0,
                tmp = void 0;

            var that = this;
            var $rail = $(document.createElement('span'));
            var namePrefix = this.name + rb.elementSeparator;
            var progressClass = namePrefix + 'progress';
            var thumbClass = namePrefix + 'thumb';
            var tooltipClass = namePrefix + 'tooltip';
            var tooltipValueClass = tooltipClass + rb.nameSeparator + 'value';
            var trackClass = namePrefix + 'track';

            var handles = '<span class="' + thumbClass + '" role="slider" tabindex="0">' + '<span class="' + tooltipClass + '"> ' + '<span class="' + tooltipValueClass + '"></span>' + '</span>' + '</span>';

            tmp = '<span class="' + progressClass + ' ' + progressClass + '-min"></span>';

            if (this.values.length > 1) {
                tmp += '<span class="' + progressClass + ' ' + progressClass + '-max"></span>';
            }

            handles = tmp + handles.repeat(this.values.length);

            $rail.prop({
                className: namePrefix + 'rail',
                innerHTML: '<span class="' + trackClass + '">' + handles + '</span>'
            });

            this.track = $rail.find('.' + trackClass).get(0);

            this.thumbs = $rail.find('.' + thumbClass).get();
            this.tooltips = $rail.find('.' + tooltipValueClass).get();

            $progress = $rail.find('.' + progressClass);

            this.progressMin = $progress.get(0);
            this.progressMax = $progress.get(1);

            if (this.thumbs.length > 1) {
                this.thumbs[0].setAttribute('aria-controls', this.getId(this.thumbs[1]));
                this.thumbs[this.thumbs.length - 1].setAttribute('aria-controls', this.getId(this.thumbs[this.thumbs.length - 2]));
            }

            this._setupEvents();
            this._setThumbValues();
            this._updateMinMax();

            list = that.element.querySelector(that.name + rb.elementSeparator + 'list');
            if (list) {
                that.track.appendChild(list);
            }

            this._addLabelTitles();

            that.$element.append($rail.get(0));
        };

        Range.prototype._addLabelTitles = function _addLabelTitles() {
            var that = this;
            var options = this.options;
            var titles = Range.makeArray(options.titles);
            var labelIds = Range.makeArray(options.labelIds);
            var labels = Range.makeArray(options.labels);

            if (this.inputs.length && !titles.length && !labelIds.length && !labels.length) {
                this.inputs.forEach(function (input) {
                    var title = input.title;

                    var id = '';
                    var elem = input.labels && input.labels[0];

                    if (!('labels' in input) && input.id) {
                        elem = document.querySelector('label[for="' + input.id + '"]');
                    }

                    if (elem) {
                        id = that.getId(elem);
                    }

                    titles.push(title);
                    labelIds.push(id);
                });
            }

            this.thumbs.forEach(function (thumb, index) {
                if (titles[index]) {
                    thumb.title = titles[index];
                }
                if (labels[index]) {
                    thumb.setAttribute('aria-label', labels[index]);
                }
                if (labelIds[index]) {
                    thumb.setAttribute('aria-labelledby', labelIds[index]);
                }
            });
        };

        Range.prototype._detectAxis = function _detectAxis() {
            this.axis = this.options.axis;
            if (this.axis == 'auto') {
                this.axis = 'horizontal';
                if (this.element.offsetHeight - 9 > this.element.offsetWidth) {
                    this.axis = 'vertical';
                }
            }
            this.props = Range[this.axis];

            if (!this.props) {
                this.log('unknown axis: ' + this.axis, this);
            }
        };

        Range.prototype._getOptionsByInputs = function _getOptionsByInputs() {
            var inputOpts = this.options.inputs;

            this.inputs = [];
            this.values = [];

            if (inputOpts) {
                this.inputs = rb.elementFromStr(inputOpts, this.element);
            }
            this.updateInputData();
        };

        Range.prototype._updateMinMax = function _updateMinMax() {
            $(this.thumbs).attr({
                'aria-valuemax': this.max,
                'aria-valuemin': this.min
            });
        };

        Range.prototype._setActivateClass = function _setActivateClass() {
            this.element.classList[this.isActivated ? 'add' : 'remove'](rb.statePrefix + 'active');
        };

        Range.prototype._activate = function _activate(index) {
            if (!this.isActivated) {
                this.isActivated = true;
                if (index != null) {
                    $(this.thumbs[index]).stop();
                }
                this._setActivateClass();
            }
        };

        Range.prototype._deactivate = function _deactivate(index) {
            if (this.isActivated) {
                this.isActivated = false;
                this._setActivateClass();

                this.trigger({ origin: 'component', index: index });
            }
        };

        Range.prototype._setAnimateClass = function _setAnimateClass() {
            this.element.classList[this.isAnimated ? 'add' : 'remove'](rb.statePrefix + 'animate');
        };

        Range.prototype._setAnimate = function _setAnimate(animate) {
            animate = !!animate;
            if (animate != this.isAnimated) {
                this.isAnimated = animate;
                this._setAnimateClass();
            }
        };

        Range.prototype._getNearestThumb = function _getNearestThumb(pos) {
            return Range.getNearestIndex(pos, this.pos);
        };

        Range.prototype._setupEvents = function _setupEvents() {
            var outerBox = void 0,
                notMoved = void 0,
                index = void 0;
            var that = this;

            this.$element.draggy('destroy');

            this.$element.draggy({
                vertical: this.axis == 'vertical',
                horizontal: this.axis == 'horizontal',
                start: function start(draggy) {
                    var pos = void 0;
                    notMoved = true;
                    outerBox = that.track.getBoundingClientRect();
                    //y
                    pos = (draggy.curPos[that.props.viewPos] - outerBox[that.props.pos]) / outerBox[that.props.dim] * 100;

                    if (that.axis == 'vertical') {
                        pos *= -1;
                    }

                    index = that._getNearestThumb(pos);
                    that._setValue(that.posToValue(pos), index, that.options.animate);
                    that.setFocus(that.thumbs[index]);
                    that._activate(index);
                },
                move: function move(draggy) {
                    var pos = (draggy.curPos[that.props.viewPos] - outerBox[that.props.pos]) / outerBox[that.props.dim] * 100;

                    if (that.axis == 'vertical') {
                        pos *= -1;
                    }

                    if (notMoved) {
                        $(that.thumbs[index]).stop();
                        notMoved = false;
                    }
                    that._setValue(that.posToValue(pos), index);
                },
                end: function end() {
                    that._deactivate(index);
                }
            });

            $(this.inputs).each(function (index, input) {
                var change = rb.throttle(function () {
                    var value = that.parseNumber(input.value);

                    if (!isNaN(value)) {
                        that._setValue(that.constrainMinMax(value), index, that.options.animate);
                    }
                }, { delay: 99, simple: true });

                $(input).on('change', change).on('input', change);
            });

            $(this.thumbs).each(function (index, thumb) {
                $(thumb).on('keyup', function () {
                    that._deactivate(index);
                }).on('keydown', function (e) {
                    var step = void 0,
                        value = void 0;

                    var code = e.keyCode;

                    if (code == 39 || code == 38) {
                        step = that.defaultStep;
                    } else if (code == 37 || code == 40) {
                        step = that.defaultStep * -1;
                    } else if (code == 33) {
                        step = that.largeStep;
                    } else if (code == 34) {
                        step = that.largeStep * -1;
                    } else if (code == 36) {
                        value = that.min;
                    } else if (code == 35) {
                        value = that.max;
                    }

                    if (step != null || value != null) {
                        e.preventDefault();
                        that._activate(index);
                        if (step != null) {
                            that._doStep(step, index);
                        } else {
                            that._setValue(value, index);
                        }
                    }
                });
            });
        };

        Range.prototype._handleInputProperties = function _handleInputProperties(input) {
            var max = input.getAttribute('data-max') || input.getAttribute('max');
            var min = input.getAttribute('data-min') || input.getAttribute('min');

            var value = this.parseNumber(input.value);
            var step = this.step == null && (input.getAttribute('data-step') || input.getAttribute('step'));

            if (max) {
                max = parseFloat(max);
                if (this.max == null || max > this.max) {
                    this.max = max;
                }
            }

            if (min) {
                min = parseFloat(min);
                if (this.min == null || min < this.min) {
                    this.min = min;
                }
            }

            if (step) {
                this.step = step;
            }

            return value;
        };

        Range.prototype._parseInputsProperties = function _parseInputsProperties() {
            this.values = this.inputs.map(this._handleInputProperties, this);
        };

        Range.prototype._doStep = function _doStep(factor, index, animate) {
            if (!factor) {
                factor = 1;
            }
            this._setValue(this.constrainMinMax(this.getValues(index) + this.defaultStepping * factor), index, animate);
        };

        Range.prototype._setValue = function _setValue(value, index, animate) {
            var changed = void 0,
                beforeValue = void 0,
                afterValue = void 0;

            if (index == null) {
                index = 0;
            }

            if (this.values[index] !== value) {
                changed = true;
                beforeValue = this.values[index - 1];
                afterValue = this.values[index + 1];

                if (beforeValue != null && beforeValue > value) {
                    this._setValue(value, index - 1, animate);
                } else if (afterValue != null && afterValue < value) {
                    this._setValue(value, index + 1, animate);
                }
                this.values[index] = value;
            }

            if (changed) {
                this._setAnimate(animate);
                this._setThumbValues(index);
                this._setInputValues(index);
                this.oninput.fireWith(this, [index, this._origin]);
            }
        };

        Range.prototype._clacSteps = function _clacSteps() {
            var range = this.max - this.min;
            this.defaultStep = 1;

            this.defaultStepping = this.options.step == 'any' ? Math.min(1, range / 100) : this.options.step;

            this.largeStep = Math.max(this.defaultStep * 2, range / this.defaultStep / 10);
        };

        Range.prototype._setThumbValue = function _setThumbValue(thumb, index) {
            var value = this.values[index];
            var pos = this.valueToPos(value);
            var formatted = this.formatNumber(value);

            this.pos[index] = pos;
            thumb.style[this.props.pos] = pos + '%';
            thumb.setAttribute('aria-valuenow', value);
            thumb.setAttribute('aria-valuetext', this.formatNumber(value));
            this.tooltips[index].setAttribute('data-value', formatted);

            if (index === 0) {
                this.progressMin.style[this.props.dim] = pos + '%';
            } else if (index == this.thumbs.length - 1 && this.progressMax) {
                this.progressMax.style[this.props.dim] = 100 - pos + '%';
            }
        };

        Range.prototype._setThumbValues = function _setThumbValues(index) {
            if (index == null) {
                this.thumbs.forEach(this._setThumbValue, this);
            } else if (this.thumbs[index]) {
                this._setThumbValue(this.thumbs[index], index);
            }
        };

        Range.prototype._setInputValue = function _setInputValue(input, index) {
            var value = this.values[index];

            value = input.type == 'text' ? this.formatNumber(this.values[index]) : value;
            if (value != input.value) {
                input.value = value;
            }
        };

        Range.prototype._setInputValues = function _setInputValues(index) {
            if (index == null) {
                this.inputs.forEach(this._setInputValue, this);
            } else if (this.inputs[index]) {
                this._setInputValue(this.inputs[index], index);
            }
        };

        return Range;
    }(rb.Component);

    Object.assign(Range, {
        horizontal: {
            pos: 'left',
            dim: 'width',
            viewPos: 'x',
            mousePos: 'clientX'
        },
        vertical: {
            pos: 'bottom',
            dim: 'height',
            viewPos: 'y',
            mousePos: 'clientY'
        },
        getNearestIndex: function getNearestIndex(pos, array) {
            var i = void 0,
                len = void 0,
                cur = void 0,
                tmp = void 0;

            var index = -1;

            for (i = 0, len = array.length; i < len; i++) {
                tmp = Math.abs(pos - array[i]);
                if (!cur || cur > tmp) {
                    index = i;
                    cur = tmp;
                }
            }
            return index;
        },
        makeArray: function makeArray(array) {
            if (!Array.isArray(array)) {
                array = array != null ? [array] : [];
            }
            return array;
        }
    });

    rb.live.register('range', Range);

    exports.default = Range;
});
