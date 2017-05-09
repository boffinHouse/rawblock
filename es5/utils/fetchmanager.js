(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './fetch', './deferred', '../rb_$/$_param', '../rb_$/$_callbacks', '../rb_$/$_extend'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./fetch'), require('./deferred'), require('../rb_$/$_param'), require('../rb_$/$_callbacks'), require('../rb_$/$_extend'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.fetch, global.deferred, global.$_param, global.$_callbacks, global.$_extend);
        global.fetchmanager = mod.exports;
    }
})(this, function (exports, _fetch, _deferred, _$_param, _$_callbacks, _$_extend) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _fetch2 = _interopRequireDefault(_fetch);

    var _deferred2 = _interopRequireDefault(_deferred);

    var _$_param2 = _interopRequireDefault(_$_param);

    var _$_callbacks2 = _interopRequireDefault(_$_callbacks);

    var _$_extend2 = _interopRequireDefault(_$_extend);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var rb = window.rb;

    var FetchManager = function FetchManager(managerId, options) {

        if (!(this instanceof FetchManager)) {
            return new FetchManager(managerId, options);
        }

        if ((typeof managerId === 'undefined' ? 'undefined' : _typeof(managerId)) == 'object') {
            options = managerId;
            managerId = null;
        }

        if (FetchManager.managers[managerId]) {
            if (options) {
                FetchManager.managers[managerId].setOptions(options);
            }
            rb.logWarn(managerId + 'already exists. extending options', FetchManager.managers[managerId]);
            return FetchManager.managers[managerId];
        }

        if (managerId) {
            FetchManager.managers[managerId] = this;
        }

        this.requestingPromises = [];
        this.waitingPromises = [];
        this.promises = {};

        this.options = Object.assign({
            maxRequests: 1,
            type: 'queue', // 'queue', 'clear', 'abort'
            fetchOpts: {}, // defaults for every fetch
            preventDouble: true
        }, options);
    };

    Object.assign(FetchManager.prototype, {
        fetch: function fetch(url, options) {
            var id = void 0;
            var managerOptions = this.options;

            if ((typeof url === 'undefined' ? 'undefined' : _typeof(url)) == 'object') {
                options = url;
                url = options;
            }

            options = options || {};

            if (typeof url == 'string') {
                options.url = url;
            }

            options = Object.assign({}, managerOptions.fetchOpts, options);

            id = this.generateId(options);

            if (this.promises[id]) {
                if (managerOptions.preventDouble) {
                    return this.promises[id];
                }
                id += rb.getID();
            }

            this.generateFetchPromise(id, options);

            this.startFetch();

            return this.promises[id];
        },
        getCombindedPromise: function getCombindedPromise(all) {
            var promises = this.requestingPromises;

            if (all) {
                promises = promises.concat(this.waitingPromises);
            }

            return Promise.all(promises).catch(function (error) {
                return error;
            });
        },
        generateFetchPromise: function generateFetchPromise(id, options) {
            var _this = this;

            var that = this;
            var promise = (0, _deferred2.default)();

            var onComplete = function onComplete() {
                that.onComplete(id);
            };

            Object.assign(promise, {
                id: id,
                options: options,
                abortCb: (0, _$_callbacks2.default)(),
                abort: function abort() {
                    that.abort(id);
                }
            });

            promise.onAbort = promise.abortCb.add;
            promise.offAbort = promise.abortCb.remove;

            this.waitingPromises.push(promise);
            promise.then(function () {
                _this.onComplete(id, true);
            }, onComplete);

            this.promises[id] = promise;
        },
        onComplete: function onComplete(id, cacheable) {
            this.removePromise(id, cacheable);

            this.startFetch();
        },
        removePromise: function removePromise(id, cacheable) {
            var _this2 = this;

            var requestingPromisesIndex = this.requestingPromises.findIndex(findById, id);
            var waitingPromisesIndex = this.waitingPromises.findIndex(findById, id);

            if (this.promises[id]) {
                if (!cacheable || !this.options.cache) {
                    this.promises[id] = null;
                } else if (typeof this.options.cache == 'number') {
                    setTimeout(function () {
                        _this2.promises[id] = null;
                    }, this.options.cache * 1000);
                }
            }

            if (requestingPromisesIndex != -1) {
                this.requestingPromises.splice(requestingPromisesIndex, 1);
            }
            if (waitingPromisesIndex != -1) {
                this.requestingPromises.splice(waitingPromisesIndex, 1);
            }
        },
        startFetch: function startFetch() {
            var promise = void 0,
                that = void 0;
            var managerOptions = this.options;

            if (!this.waitingPromises.length) {
                return;
            }

            if (this.requestingPromises.length < managerOptions.maxRequests) {
                that = this;
                promise = this.waitingPromises.shift();

                this.requestingPromises.push(promise);
                promise.fetch = (0, _fetch2.default)(promise.options);

                promise.onAbort(function () {
                    that.onComplete(promise.id);
                });

                promise.fetch.then(function (data) {
                    promise.resolve(data);
                }, function (data) {
                    promise.catch(rb.log);
                    promise.reject(data);
                });

                return;
            }

            if (managerOptions.type == 'clear' && this.waitingPromises.length > 1) {
                this.waitingPromises.shift();
            }

            if (managerOptions.type == 'abort' && this.requestingPromises[0] && this.requestingPromises[0].fetch) {
                this.requestingPromises[0].fetch.abort();

                this.onComplete(this.requestingPromises[0].id);
            }
        },
        _onOptionChange: function _onOptionChange() {
            var managerOptions = this.options;

            do {
                this.startFetch();
            } while (this.waitingPromises.length && this.requestingPromises.length < managerOptions.maxRequests);
        },
        setOption: function setOption(name, value) {
            var managerOptions = this.options;

            managerOptions[name] = value;

            this._onOptionChange();
        },
        setOptions: function setOptions(options) {
            (0, _$_extend2.default)(true, this.options, options);
            this._onOptionChange();
        },
        abort: function abort(id) {
            if (!this.promises[id]) {
                return;
            }

            if (this.promises[id].fetch) {
                this.promises[id].fetch.abort();
            }

            this.onComplete(id);
        },
        generateId: function generateId(options) {
            var id = [options.url];

            if (options.data) {
                id.push((0, _$_param2.default)(options.data));
            }

            if (options.headers) {
                id.push((0, _$_param2.default)(options.headers));
            }

            return id.join(',');
        }
    });

    FetchManager.managers = {};

    FetchManager.fetch = function (managerId, url, options) {
        var manager = FetchManager.managers[managerId];
        return manager && manager.fetch(url, options);
    };

    FetchManager.setOption = function (managerId, name, value) {
        var manager = FetchManager.managers[managerId];
        return manager && manager.setOption(name, value);
    };

    rb.fetchManager = FetchManager;

    /* jshint validthis: true */
    function findById(item) {
        return item.id == this;
    }

    exports.default = FetchManager;
});
