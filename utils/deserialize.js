const rb = window.rb;

const regQ = /^\?/;

const addProps = function(param){
    if(!param){
        return;
    }

    param = param.split('=');

    this[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || '');
};

rb.deserialize = function(str){
    const obj = {};

    str.replace(regQ, '').replace('+', ' ').split('&').forEach(addProps, obj);

    return obj;
};

export default rb.deserialize;
