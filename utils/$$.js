const arrayProto = Array.prototype;
const slice = arrayProto.slice;
const rb = window.rb;

const $$ = function(elements, context){
    if (!(this instanceof $$)) {
        return new $$(elements);
    }

    if (typeof elements == 'string') {
        elements = Array.from((context || document).querySelectorAll(elements));
    } else if (typeof elements == 'function') {
        if ($$.isReady) {
            elements($$);
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                elements($$);
            });
        }
        return;
    }

    if (!Array.isArray(elements)) {
        if (!elements) {
            elements = [];
        } else if (elements.nodeName || !('length' in elements) || elements == window) {
            elements = [elements];
        } else {
            elements = Array.from(elements);
        }
    }

    this.items = elements;
    this.length = this.items.length || 0;
};

const fn = $$.prototype;

rb.$$ = $$;

Object.assign($$, {
    isReady: document.readyState != 'loading',
});

Object.assign(fn, {
    pushStack(items){
        const ret = new $$(items);
        ret.prevObject = this;
        return ret;
    },
    end: function() {
        return this.prevObject || this.constructor();
    },
    get(name){
        return this.pushStack(this.items.map(function(item){
            return item[name];
        }));
    },
    set(name, value){
        this.items.forEach(function(item){
            item[name] = value;
        });

        return this;
    },
    call(name){
        const items = [];
        const args = slice.call(arguments);

        args.shift();

        this.items.forEach(function(item){
            const value = item[name].apply(item, args);

            if(value != null){
                items.push(value);
            }
        });

        return items.length ? this.pushStack(items) : this;
    },
});

Object.getOwnPropertyNames(arrayProto).forEach(function(name){
    if(!fn[name] && typeof arrayProto[name] == 'function'){
        fn[name] = function(){
            let ret = this;
            const result = this.items[name].apply(this.items, arguments);

            if(result != null && this.items != result){
                if(Array.isArray(result)){
                    ret = this.pushStack(result);
                } else {
                    ret = result;
                }
            }

            return ret;
        };
    }
});

if (!$$.isReady) {
    document.addEventListener('DOMContentLoaded', function () {
        $$.isReady = true;
    });
}

export default $$;
