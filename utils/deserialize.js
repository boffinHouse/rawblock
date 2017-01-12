const rb = window.rb;

const regQ = /^\?/;
const regPlus = /\+/g;
const regArray = /\[]$/;

const addProps = function(param){
    if(!param){
        return;
    }

    param = param.split('=');

    let key = decodeURIComponent(param[0]);
    const value = decodeURIComponent(param[1] || '');

    if(regArray.test(key)){
        key = key.replace(regArray, '');

        if(!(key in this)){
            this[key] = [];
        }
    }

    let type = typeof this[key];

    if((key in this) && type == 'string'){
        this[key] = [this[key]];
        type = 'object';
    }

    if(type == 'object'){
        this[key].push(value);
    } else {
        this[key] = value;
    }

};

rb.deserialize = function(str){
    const obj = {};

    str.replace(regQ, '').replace(regPlus, ' ').split('&').forEach(addProps, obj);

    return obj;
};

export default rb.deserialize;
