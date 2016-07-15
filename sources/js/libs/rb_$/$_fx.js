(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    /* jshint eqnull: true */
    var Dom = window.rb && rb.$ || window.jQuery;
    var steps = {};

    var regUnit = /^\d+\.*\d*(px|em|rem|%|deg)$/;
    var tween = function (element, endProps, options) {

        var easing, isStopped, isJumpToEnd, duration;
        var hardStop = false;
        var start = Date.now();
        var elementStyle = element.style;
        var props = {};
        var rAF = rb.rAFQueue;
        var stop = function (clearQueue, jumpToEnd) {
            isStopped = true;
            if (jumpToEnd) {
                isJumpToEnd = true;
            }
            if (clearQueue && Dom.fn.clearQueue && options.queue !== false) {
                new Dom(element).clearQueue(options.queue);
            }
            step();
            hardStop = true;
        };
        var tweenObj = {};
        var alwaysEnd = function () {
            if (options.always) {
                options.always.call(element);
            }
            if (Dom.dequeue) {
                if (options.queue !== false) {
                    Dom.dequeue(element, options.queue);
                }
            }
        };
        var step = function () {
            if (hardStop) {
                return;
            }
            var prop, value, eased;
            var pos = (Date.now() - start) / duration;

            if (pos > 1 || isJumpToEnd) {
                pos = 1;
            }

            if (!isStopped) {
                eased = easing(pos);

                for (prop in props) {
                    value = (props[prop].end - props[prop].start) * eased + props[prop].start;

                    if (options.step) {
                        options.step.call(element, value);
                    }

                    if (prop in steps) {
                        props[prop].pos = eased;
                        props[prop].now = value;
                        steps[prop](props[prop]);
                    } else if (prop in elementStyle) {
                        if (!Dom.cssNumber[prop]) {
                            value += props[prop].unit;
                        }
                        elementStyle[prop] = value;
                    } else {
                        element[prop] = value;
                    }
                }

                if (options.progress) {
                    options.progress.call(element, tweenObj, pos);
                }
            }

            if (pos < 1) {
                if (!isStopped) {
                    rAF(step, false, true);
                } else {
                    alwaysEnd();
                }
            } else {
                if (element._rbTweenStop) {
                    delete element._rbTweenStop;
                }
                if (options.complete && !isStopped) {
                    options.complete.call(element);
                }
                alwaysEnd();
            }
        };

        options = Object.assign({duration: 400, easing: 'ease'}, options || {});

        duration = (Dom.fx.off) ? 0 : options.duration;

        tween.createPropValues(element, elementStyle, props, endProps, options);

        easing = Dom.easing[options.easing] || Dom.easing.ease || Dom.easing.swing;
        element._rbTweenStop = stop;
        tweenObj.opts = options;
        tweenObj.props = endProps;

        rAF(step, false, true);
    };

    tween.createPropValues = function (element, elementStyle, props, endProps, options) {
        var prop, unit, tmpValue;
        var styles = rb.getStyles(element);
        for (prop in endProps) {
            props[prop] = {
                elem: element,
                options: options,
            };

            if (typeof endProps[prop] == 'string') {
                unit = endProps[prop].match(regUnit);
                tmpValue = parseFloat(endProps[prop]);

                props[prop].end = isNaN(tmpValue) ? endProps[prop] : tmpValue;
            } else {
                props[prop].end = endProps[prop] || 0;
            }

            props[prop].unit = unit && unit[1] || 'px';

            if (Dom.cssHooks[prop] && Dom.cssHooks[prop].get) {
                props[prop].start = Dom.cssHooks[prop].get(element);
            } else if (prop in elementStyle) {
                props[prop].start = (styles.getPropertyValue(prop) || styles[prop]);
            } else {
                props[prop].start = element[prop] || 0;
            }

            tmpValue = parseFloat(props[prop].start);

            props[prop].start = isNaN(tmpValue) ? props[prop].start : tmpValue;
        }
    };

    if(!Dom.fx){
        Dom.fx = {step: steps};
    }

    if(!Dom.easing){
        Dom.easing = {
            linear: function (pos) {
                return pos;
            },
            swing: function (p) {
                return 0.5 - Math.cos(p * Math.PI) / 2;
            }
        };
    }

    if(!Dom.fn.animate || !Dom.fn.stop){
        Object.assign(Dom.fn, {
            animate: function (endProps, options) {
                var queue = (!options || options.queue !== false) && Dom.queue;
                var start = function () {
                    tween(this, endProps, options);
                };

                this.each(function () {
                    var queues;
                    var elem = this;
                    var queueName = options && options.queue;
                    if (queue) {
                        queues = Dom.queue(elem, queueName, start);
                        if (queues.length == 1) {
                            Dom.queue(elem, queueName, function () {
                                Dom.dequeue(elem, queueName);
                            });
                            if (!queueName || queueName == 'fx') {
                                Dom.dequeue(elem, queueName);
                            }
                        }
                    } else {
                        tween(elem, endProps, options);
                    }
                });
                return this;
            },
            stop: function (clearQueue, jumpToEnd) {
                this.each(function () {
                    var elem = this;
                    if (elem._rbTweenStop) {
                        elem._rbTweenStop(clearQueue, jumpToEnd);
                    }
                });
                return this;
            },
        });
    }

    return Dom.fx;
}));
