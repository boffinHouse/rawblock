(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports !== "undefined") {
        factory();
    } else {
        var mod = {
            exports: {}
        };
        factory();
        global.rb_queue = mod.exports;
    }
})(this, function () {
    'use strict';

    var queueExpando = void 0;
    var defaultQueue = 'fx';
    var rb = window.rb;
    var $ = rb.$;

    $.queue = function (element, queue, cb) {
        var queues;

        if (typeof queue == 'function') {
            cb = queue;
            queue = defaultQueue;
        }

        if (queue === true || !queue) {
            queue = defaultQueue;
        }

        if (!queueExpando) {
            queueExpando = rb.Symbol('_rbQueue');
        }

        if (!(queues = element[queueExpando])) {
            queues = {};
            element[queueExpando] = queues;
        }

        if (!queues[queue]) {
            queues[queue] = [];
        }

        if (cb) {
            queues[queue].push(cb);
        }

        return queues[queue];
    };

    $.dequeue = function (element, queue) {
        var queues, fn;

        if (!queue || queue === true) {
            queue = defaultQueue;
        }

        queues = queueExpando && element[queueExpando];

        if (queues && queues[queue] && (fn = queues[queue].shift())) {
            fn.call(element);
        }

        return queues[queue];
    };

    $.fn.promise = function (queue) {
        var _run, queues, _queueToEnd;
        var deferred = {
            resolve: function resolve() {
                if (!_run) {
                    _run = true;
                    setTimeout(deferred.resolve);
                }
            }
        };
        var promise = new Promise(function (resolve) {
            deferred.resolve = resolve;
        });
        var element = this.get(0);

        if (element) {
            _queueToEnd = function queueToEnd() {
                if (queues.length) {
                    $.queue(element, queue, _queueToEnd);
                    $.dequeue(element, queue);
                } else {
                    deferred.resolve();
                }
            };
            queues = $.queue(element, queue, _queueToEnd);
            if (queues.length == 1) {
                $.dequeue(element, queue);
            }
        } else {
            deferred.resolve();
        }
        return promise;
    };

    ['queue', 'dequeue'].forEach(function (methodName) {
        $.fn[methodName] = function (queue, callback) {
            this.elements.forEach(function (element) {
                $[methodName](element, queue, callback);
            });
            return this;
        };
    });

    $.fn.delay = function (queue, duration, cb) {

        if (typeof queue == 'number') {
            cb = duration;
            duration = queue;
            queue = defaultQueue;
        }

        this.queue(queue, function () {
            var elem = this;
            var start = Date.now();
            var startRaf = function startRaf() {
                rb.rAFQueue(check, false, true);
            };
            var check = function check() {
                if (Date.now() - start >= duration) {
                    if (cb) {
                        cb.call(elem);
                    }
                    $.dequeue(elem, queue);
                } else {
                    rb.rAFQueue(check, false, true);
                }
            };
            if (duration > 66) {
                setTimeout(startRaf, duration - 66);
            } else {
                rb.rAFQueue(check, false, true);
            }
            duration -= 5;
        });
        return this;
    };

    $.fn.clearQueue = function (queue) {
        this.elements.forEach(function (element) {
            var queues = $.queue(element, queue);
            if (queues.length) {
                queues.splice(0, queues.length);
            }
        });
        return this;
    };
});
