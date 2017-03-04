import fetch from './fetch';
import deferred from './deferred';
import param from '../rb_$/$_param';
import callbacks from '../rb_$/$_callbacks';
import extend from '../rb_$/$_extend';

const rb = window.rb;

const FetchManager = function(managerId, options){

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
        let id;
        const managerOptions = this.options;

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
        let promises = this.requestingPromises;

        if(all){
            promises = promises.concat(this.waitingPromises);
        }

        return Promise.all(promises).catch(function (error){
            return error;
        });
    },
    generateFetchPromise: function(id, options){
        const that = this;
        const promise = deferred();

        const onComplete = function(){
            that.onComplete(id);
        };

        Object.assign(promise, {
            id: id,
            options: options,
            abortCb: callbacks(),
            abort: function(){
                that.abort(id);
            },
        });

        promise.onAbort = promise.abortCb.add;
        promise.offAbort = promise.abortCb.remove;

        this.waitingPromises.push(promise);
        promise.then(()=>{
            this.onComplete(id, true);
        }, onComplete);

        this.promises[id] = promise;
    },
    onComplete: function(id, cacheable){
        this.removePromise(id, cacheable);

        this.startFetch();
    },
    removePromise: function(id, cacheable){
        const requestingPromisesIndex = this.requestingPromises.findIndex(findById, id);
        const waitingPromisesIndex = this.waitingPromises.findIndex(findById, id);

        if(this.promises[id]){
            if((!cacheable || !this.options.cache)){
                this.promises[id] = null;
            } else if(typeof this.options.cache == 'number') {
                setTimeout(()=>{
                    this.promises[id] = null;
                }, this.options.cache * 1000);
            }
        }

        if(requestingPromisesIndex != -1){
            this.requestingPromises.splice(requestingPromisesIndex, 1);
        }
        if(waitingPromisesIndex != -1){
            this.requestingPromises.splice(waitingPromisesIndex, 1);
        }
    },
    startFetch: function(){
        let promise, that;
        const managerOptions = this.options;

        if(!this.waitingPromises.length){return;}

        if(this.requestingPromises.length < managerOptions.maxRequests){
            that = this;
            promise = this.waitingPromises.shift();

            this.requestingPromises.push(promise);
            promise.fetch = fetch(promise.options);

            promise.onAbort(function(){
                that.onComplete(promise.id);
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
        const managerOptions = this.options;

        do {
            this.startFetch();
        } while(this.waitingPromises.length && this.requestingPromises.length < managerOptions.maxRequests);
    },
    setOption: function(name, value){
        const managerOptions = this.options;

        managerOptions[name] = value;

        this._onOptionChange();
    },
    setOptions: function(options){
        extend(true, this.options, options);
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
        const id = [options.url];

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
    const manager = FetchManager.managers[managerId];
    return manager && manager.fetch(url, options);
};

FetchManager.setOption = function(managerId, name, value){
    const manager = FetchManager.managers[managerId];
    return manager && manager.setOption(name, value);
};

rb.fetchManager = FetchManager;

/* jshint validthis: true */
function findById(item){
    return item.id == this;
}

export default FetchManager;
