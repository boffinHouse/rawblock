(function (factory) {
    if (typeof module === 'object' && module.exports) {
        require('./rb_fetch');
        require('./rb$_param');
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    var rb = window.rb;
    var $ = rb.$;
    var param = $.param;
    var fetch = rb.fetch;

    var FetchManager = function(managerId, options){

        if (!(this instanceof FetchManager)) {
            return new FetchManager(managerId, options);
        }

        if(typeof managerId == 'object'){
            options = managerId;
            managerId = null;
        }

        if(FetchManager.managers[managerId]){
            if(options){
                FetchManager.managers[managerId].setOptions(options);
            }
            rb.logWarn(managerId + 'already exists. extending options', FetchManager.managers[managerId]);
            return FetchManager.managers[managerId];
        }

        if(managerId){
            FetchManager.managers[managerId] = this;
        }

        this.requestingPromises = [];
        this.waitingPromises = [];
        this.promises = {};

        this.options = Object.assign({
            maxRequests: 1,
            type: 'queue', // 'queue', 'clear', 'abort'
            fetchOpts: {}, // defaults for every fetch
            preventDouble: true,
        }, options);
    };


    Object.assign(FetchManager.prototype, {
        fetch: function(url, options){
            var id;
            var managerOptions = this.options;

            if(typeof url == 'object'){
                options = url;
                url = options;
            }

            options = options || {};

            if(typeof url == 'string'){
                options.url = url;
            }

            options = Object.assign({}, managerOptions.fetchOpts, options);

            id = this.generateId(options);

            if(this.promises[id]){
                if(managerOptions.preventDouble){
                    return this.promises[id];
                }
                id += rb.getID();
            }

            this.generateFetchPromise(id, options);

            this.startFetch();

            return this.promises[id];
        },
        getCombindedPromise: function(all){
            var promises = this.requestingPromises;

            if(all){
                promises = promises.concat(this.waitingPromises);
            }

            return Promise.all(promises).catch(function (error){
                return error;
            });
        },
        generateFetchPromise: function(id, options){
            var that = this;
            var promise = rb.deferred();

            var onComplete = function(){
                that.onComplete(id);
            };

            Object.assign(promise, {
                id: id,
                options: options,
                abortCb: $.Callbacks(),
                abort: function(){
                    that.abort(id);
                },
            });

            promise.onAbort = promise.abortCb.add;
            promise.offAbort = promise.abortCb.remove;

            this.waitingPromises.push(promise);
            promise.then(onComplete, onComplete);

            this.promises[id] = promise;
        },
        onComplete: function(id){
            this.removePromise(id);

            this.startFetch();
        },
        removePromise: function(id){
            var requestingPromisesIndex = this.requestingPromises.findIndex(findById, id);
            var waitingPromisesIndex = this.waitingPromises.findIndex(findById, id);

            if(this.promises[id]){
                this.promises[id] = null;
            }

            if(requestingPromisesIndex != -1){
                this.requestingPromises.splice(requestingPromisesIndex, 1);
            }
            if(waitingPromisesIndex != -1){
                this.requestingPromises.splice(waitingPromisesIndex, 1);
            }
        },
        startFetch: function(){
            var promise, that;
            var managerOptions = this.options;

            if(!this.waitingPromises.length){return;}

            if(this.requestingPromises.length < managerOptions.maxRequests){
                that = this;
                promise = this.waitingPromises.shift();

                this.requestingPromises.push(promise);
                promise.fetch = fetch(promise.options);

                promise.onAbort(function(){
                    that.onComplete(id);
                });

                promise.fetch.then(
                    function(data){
                        promise.resolve(data);
                    },
                    function(data){
                        promise.catch(rb.log);
                        promise.reject(data);
                    }
                );

                return;
            }

            if(managerOptions.type == 'clear' && this.waitingPromises.length > 1){
                this.waitingPromises.shift();
            }

            if(managerOptions.type == 'abort' && this.requestingPromises[0] && this.requestingPromises[0].fetch){
                this.requestingPromises[0].fetch.abort();

                this.onComplete(this.requestingPromises[0].id);
            }

        },
        _onOptionChange: function(){
            var managerOptions = this.options;
            do {
                this.startFetch();
            } while(this.waitingPromises.length && this.requestingPromises.length < managerOptions.maxRequests);
        },
        setOption: function(name, value){
            var managerOptions = this.options;

            managerOptions[name] = value;

            this._onOptionChange();
        },
        setOptions: function(options){
            $.extend(true, this.options, options);
            this._onOptionChange();
        },
        abort: function(id){
            if(!this.promises[id]){return;}

            if(this.promises[id].fetch){
                this.promises[id].fetch.abort();
            }

            this.onComplete(id);
        },
        generateId: function(options){
            var id = [options.url];

            if(options.data){
                id.push(param(options.data));
            }

            if(options.headers){
                id.push(param(options.headers));
            }

            return id.join(',');
        },
    });

    FetchManager.managers = {};

    FetchManager.fetch = function(managerId, url, options){
        var manager = FetchManager.managers[managerId];
        return manager && manager.fetch(url, options);
    };

    FetchManager.setOption = function(managerId, name, value){
        var manager = FetchManager.managers[managerId];
        return manager && manager.setOption(name, value);
    };

    rb.fetchManager = FetchManager;

    /* jshint validthis: true */
    function findById(item){
        return item.id == this;
    }

    return FetchManager;
}));
