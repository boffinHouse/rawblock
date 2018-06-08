import glob from './glob';
import rb from './global-rb';

const console = glob.console || {};
const log = console.log && console.log.bind ? console.log : rb.$.noop; //eslint-disable-line no-unused-vars
const logs = ['error', 'warn', 'info', 'log'].map(function(errorName, errorLevel){
    const fnName = (errorName == 'log') ?
        'log' :
        'log' + (errorName.charAt(0).toUpperCase()) + (errorName.substr(1))
    ;
    return {
        name: fnName,
        errorLevel: errorLevel,
        fn: (console[errorName] && console[errorName].bind ? console[errorName] : rb.$.noop).bind(console)
    };
});


/**
 * Adds a log method and a isDebug property to an object, which can be muted by setting isDebug to false.
 * @memberof rb
 * @param obj    {Object}
 * @param [initial] {Boolean}
 */
export default function addLog(obj, initial = true) {
    const fakeLog = ()=>{};

    const setValue = function(){
        const level = obj.__isDebug;

        logs.forEach(function(log){
            const fn = (level !== false && (level === true || level >= log.errorLevel)) ?
                log.fn :
                fakeLog;

            obj[log.name] = fn;
        });
    };

    obj.__isDebug = initial;
    setValue();

    Object.defineProperty(obj, 'isDebug', {
        configurable: true,
        enumerable: true,
        get: function () {
            return obj.__isDebug;
        },
        set: function (value) {
            if(obj.__isDebug !== value){
                obj.__isDebug = value;
                setValue();
            }
        },
    });

    return obj;
}

rb.addLog = addLog;
