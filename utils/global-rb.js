const glob = typeof window != 'undefined' ?
    window :
    typeof global != 'undefined' ?
        global :
    this || {};

if(!glob.rb){
    glob.rb = {};
}

const rb = glob.rb;

export default rb;
