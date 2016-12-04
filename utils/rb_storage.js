if (!window.rb) {
    window.rb = {};
}

const rb = window.rb;

rb.storage = {};

['session', 'local'].forEach(function(type){
    let storage;
    const testStr = rb.getID();

    try {
        storage = window[type + 'Storage'];
    }
    catch(e){
        storage = {};
    }

    rb.storage[type] = {
        set: function(name, value){
            try {
                storage.setItem(name, JSON.stringify(value));
            } catch(e){
                return false;
            }
        },
        get: function(name){
            let value;

            try {
                value = JSON.parse(storage.getItem(name));
            } catch(e){
                return false;
            }

            return value;
        },
        remove: function(name){
            try {
                storage.removeItem(name);
            } catch(e){
                return false;
            }
        },
    };

    Object.defineProperty(rb.storage[type], 'supported', {
        value: rb.storage[type].set(testStr, testStr) !== false && rb.storage[type].get(testStr) == testStr,
        configurable: true,
    });

    rb.storage[type].remove(testStr);

});

export default rb.storage;
