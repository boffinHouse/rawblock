import glob from './glob';
import version from './rb-version';

if(!glob.rb){
    glob.rb = {
        version,
    };
}

const rb = glob.rb;

/**
 * rawblock main object holds classes and util properties and methods to work with rawblock
 * @namespace rb
 */

export default rb;
