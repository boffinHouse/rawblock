import rb from './global-rb';

/**
 * Creates a promise with a resolve and a reject method.
 * @returns {Deferred}
 */
export default function deferred(){
    const tmp = {
        isResolved: false,
        isRejected: false,
        isDone: false,
    };

    const promise = new Promise(function(resolve, reject){
        tmp.resolve = function(data){
            promise.isResolved = true;
            promise.isDone = true;
            promise.value = data;
            return resolve(data);
        };
        tmp.reject = function(data){
            promise.isRejected = true;
            promise.isDone = true;
            promise.value = data;
            promise.catch(value => value);
            return reject(data);
        };
    });

    Object.assign(promise, tmp);

    return promise;
}

rb.deferred = deferred;
