const glob = typeof window != 'undefined' ?
    window :
    typeof global != 'undefined' ?
        global :
    this || {};

if(!glob.rb){
    glob.rb = {};
}

const rb = glob.rb;

/**
 * rawblock main object holds classes and util properties and methods to work with rawblock
 * @namespace rb
 */

export default rb;
