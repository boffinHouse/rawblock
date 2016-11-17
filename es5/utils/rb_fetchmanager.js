(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './rb_fetch', './rb$_param'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./rb_fetch'), require('./rb$_param'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.rb_fetch, global.rb$_param);
        global.rb_fetchmanager = mod.exports;
    }
})(this, function (module) {
    'use strict';

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    (function (factory) {
        if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
            module.exports = factory();
        } else {
            factory();
        }
    })(function () {
        'use strict';

        var rb = window.rb;
        var $ = rb.$;
        var param = $.param;
        var fetch = rb.fetch;

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
                var id;
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
                var that = this;
                var promise = rb.deferred();

                var onComplete = function onComplete() {
                    that.onComplete(id);
                };

                Object.assign(promise, {
                    id: id,
                    options: options,
                    abortCb: $.Callbacks(),
                    abort: function abort() {
                        that.abort(id);
                    }
                });

                promise.onAbort = promise.abortCb.add;
                promise.offAbort = promise.abortCb.remove;

                this.waitingPromises.push(promise);
                promise.then(onComplete, onComplete);

                this.promises[id] = promise;
            },
            onComplete: function onComplete(id) {
                this.removePromise(id);

                this.startFetch();
            },
            removePromise: function removePromise(id) {
                var requestingPromisesIndex = this.requestingPromises.findIndex(findById, id);
                var waitingPromisesIndex = this.waitingPromises.findIndex(findById, id);

                if (this.promises[id]) {
                    this.promises[id] = null;
                }

                if (requestingPromisesIndex != -1) {
                    this.requestingPromises.splice(requestingPromisesIndex, 1);
                }
                if (waitingPromisesIndex != -1) {
                    this.requestingPromises.splice(waitingPromisesIndex, 1);
                }
            },
            startFetch: function startFetch() {
                var promise, that;
                var managerOptions = this.options;

                if (!this.waitingPromises.length) {
                    return;
                }

                if (this.requestingPromises.length < managerOptions.maxRequests) {
                    that = this;
                    promise = this.waitingPromises.shift();

                    this.requestingPromises.push(promise);
                    promise.fetch = fetch(promise.options);

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
                $.extend(true, this.options, options);
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
                    id.push(param(options.data));
                }

                if (options.headers) {
                    id.push(param(options.headers));
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

        return FetchManager;
    });
});
