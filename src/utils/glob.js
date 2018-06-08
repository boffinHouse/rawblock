const glob = typeof window != 'undefined' ?
    window :
    typeof global != 'undefined' ?
        global :
        this || {};

export default glob;
