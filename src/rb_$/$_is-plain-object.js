const class2type = {};
const toString = class2type.toString;
const hasOwn = class2type.hasOwnProperty;
const fnToString = hasOwn.toString;
const getProto = Object.getPrototypeOf;
const ObjectFunctionString = fnToString.call( Object );

export default function isPlainObject( obj ) {
    let proto, Ctor;

    if ( !obj || toString.call( obj ) !== '[object Object]' ) {
        return false;
    }

    proto = getProto( obj );

    if ( !proto ) {
        return true;
    }

    Ctor = hasOwn.call( proto, 'constructor' ) && proto.constructor;
    return typeof Ctor === 'function' && fnToString.call( Ctor ) === ObjectFunctionString;
}
