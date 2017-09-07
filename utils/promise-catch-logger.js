import addLog from './add-log';

const promiseProto = Promise.prototype;
const origCatch = promiseProto.catch;
const origThen = promiseProto.then;
const promiseLogger = addLog({}, 1);

promiseProto.catch = function(catchFn){

    const catchLogger = function catchLogger(error){
        if(error instanceof Error){
            promiseLogger.logError(error, 'catch logger');
        } else {
            promiseLogger.logWarn(error, 'catch logger');
        }

        return catchFn.apply(this, arguments);
    };

    return (arguments.length == 1 && typeof catchFn == 'function') ?
        origCatch.call(this, catchLogger) :
        origCatch.apply(this, arguments)
        ;
};

promiseProto.then = function (successFn, errorFn) {
    const catchLogger = function catchLogger(error){
        if(error instanceof Error){
            promiseLogger.logInfo(error, 'catch logger');
        } else {
            promiseLogger.log(error, 'catch logger');
        }

        return errorFn.apply(this, arguments);
    };

    return (arguments.length == 2 && typeof errorFn == 'function') ?
        origThen.call(this, successFn, catchLogger) :
        origThen.apply(this, arguments)
        ;
};

export default promiseLogger;
