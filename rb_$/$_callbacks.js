export default function Callbacks(flags) {
    if (flags) {
        rb.log('not supported: ' + flags);
    }
    const list = [];

    return {
        add: function (fn) {
            list.push(fn);
        },
        remove: function (fn) {
            const index = list.indexOf(fn);

            if (index != -1) {
                list.splice(index, 1);
            }
        },
        fire: function () {
            this.fireWith(this, arguments);
        },
        fireWith: function (that, args) {
            let i, len;

            for (i = 0, len = list.length; i < len; i++) {
                if(list[i]){
                    list[i].apply(that, [].concat(args));
                }
            }
        },
        has: function () {
            return !!list.length;
        },
    };
}

if(window.rb && window.rb.$){
    rb.$.Callbacks = Callbacks;
}
