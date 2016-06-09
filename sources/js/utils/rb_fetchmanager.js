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
    var param = rb.param;
    var fetch = rb.fetch;

    var FetchManager = function(managerId, options){
        if (!(this instanceof FetchManager)) {
            return new FetchManager(managerId, options);
        }

        if(typeof managerId != 'string'){
            options = managerId;
            managerId = null;
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

            this.generateFetchPromise(id);

            this.startFetch();

            return this.promises[id];

        },
        generateFetchPromise: function(id, options){
            var that = this;

            var completed = function(){
                this.completed(id);
            };

            this.promises[id] = rb.deferred();

            this.promises[id].id = id;
            this.promises[id].options = options;
            this.promises[id].abort = function(){
                that.abort(id);
            };

            this.waitingPromises.push(this.promises[id]);
            this.promises[id].then(completed, completed);
        },
        completed: function(id){
            this.removePromise(id);

            this.startFetch();
        },
        removePromise: function(id){
            var requestingPromisesIndex = this.requestingPromises.findIndex(findById, id);
            var waitingPromisesIndex = this.waitingPromises.findIndex(findById, id);

            this.promises[id] = null;

            if(requestingPromisesIndex != -1){
                this.requestingPromises.splice(requestingPromisesIndex, 1);
            }
            if(waitingPromisesIndex != -1){
                this.requestingPromises.splice(waitingPromisesIndex, 1);
            }
        },
        startFetch: function(){
            var promise;
            var managerOptions = this.options;

            if(!this.waitingPromises.length){return;}

            if(this.requestingPromises.length < managerOptions.maxRequests){
                promise = this.waitingPromises.shift();

                this.requestingPromises.push(promise);
                promise.fetch = fetch(promise.options);

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

                this.completed(this.requestingPromises[0].id);
            }

        },
        abort: function(id){
            if(!this.promises[id]){return;}

            if(this.promises[id].fetch){
                this.promises[id].fetch.abort();
            }

            this.completed(id);
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

    rb.FetchManager = FetchManager;

    /* jshint validthis: true */
    function findById(item){
        return item.id == this;
    }

    return FetchManager;
}));
