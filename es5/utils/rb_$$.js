(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.rb_$$ = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    if (!window.rb) {
        window.rb = {};
    }

    var arrayProto = Array.prototype;
    var slice = arrayProto.slice;
    var rb = window.rb;

    var $$ = function $$(elements, context) {
        if (!(this instanceof $$)) {
            return new $$(elements);
        }

        if (typeof elements == 'string') {
            elements = Array.from((context || document).querySelectorAll(elements));
        } else if (typeof elements == 'function') {
            if ($$.isReady) {
                elements($$);
            } else {
                document.addEventListener('DOMContentLoaded', function () {
                    elements($$);
                });
            }
            return;
        }

        if (!Array.isArray(elements)) {
            if (!elements) {
                elements = [];
            } else if (elements.nodeName || !('length' in elements) || elements == window) {
                elements = [elements];
            } else {
                elements = Array.from(elements);
            }
        }

        this.items = elements;
        this.length = this.items.length || 0;
    };

    var fn = $$.prototype;

    rb.$$ = $$;

    Object.assign($$, {
        isReady: document.readyState != 'loading'
    });

    Object.assign(fn, {
        pushStack: function pushStack(items) {
            var ret = new $$(items);
            ret.prevObject = this;
            return ret;
        },

        end: function end() {
            return this.prevObject || this.constructor();
        },
        get: function get(name) {
            return this.pushStack(this.items.map(function (item) {
                return item[name];
            }));
        },
        set: function set(name, value) {
            this.items.forEach(function (item) {
                item[name] = value;
            });

            return this;
        },
        call: function call(name) {
            var items = [];
            var args = slice.call(arguments);

            args.shift();

            this.items.forEach(function (item) {
                var value = item[name].apply(item, args);

                if (value != null) {
                    items.push(value);
                }
            });

            return items.length ? this.pushStack(items) : this;
        }
    });

    Object.getOwnPropertyNames(arrayProto).forEach(function (name) {
        if (!fn[name] && typeof arrayProto[name] == 'function') {
            fn[name] = function () {
                var ret = this;
                var result = this.items[name].apply(this.items, arguments);

                if (result != null && this.items != result) {
                    if (Array.isArray(result)) {
                        ret = this.pushStack(result);
                    } else {
                        ret = result;
                    }
                }

                return ret;
            };
        }
    });

    if (!$$.isReady) {
        document.addEventListener('DOMContentLoaded', function () {
            $$.isReady = true;
        });
    }

    exports.default = $$;
});
