export default function isEmptyObject(obj){
    let ret = true;

    if(obj){
        /* eslint-disable no-unused-vars */
        for(let p in obj){
            ret = false;
            break;
        }
    }

    return ret;
}
