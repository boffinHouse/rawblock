/*
 use relatedTarget in the future (needs POC):
 https://bugzilla.mozilla.org/show_bug.cgi?id=962251
 */

const rb = window.rb;
const $ = rb.$ || window.jQuery;
const sym = rb.Symbol('focusEnterLeave');

['rb_focusenter', 'rb_focusleave'].forEach(function (type) {

    rb.events.special[type] = {
        setup: function (element) {
            let evt, reset, isFocused, isEntered;
            let data = element[sym];

            if (!data) {
                isFocused = function(){
                    return document.activeElement && (element == document.activeElement || element.contains(document.activeElement));
                };

                reset = function () {
                    if (!isFocused()) {
                        isEntered = false;
                        data.rb_focusleaveCbs.fireWith(evt.target, [{target: evt.target, type: 'rb_focusleave'}]);
                    }
                };

                data = {
                    enter: function (e) {
                        if (!isEntered) {
                            isEntered = true;
                            data.rb_focusenterCbs.fireWith(e.target, [{target: e.target, type: 'rb_focusenter'}]);
                        }
                    },
                    leave: function (e) {
                        if (isEntered) {
                            evt = e;
                            setTimeout(reset);
                        }
                    },
                    rb_focusenterCbs: $.Callbacks(),
                    rb_focusleaveCbs: $.Callbacks(),
                };

                isEntered = isFocused();

                element.addEventListener('focus', data.enter, true);
                element.addEventListener('blur', data.leave, true);
                element[sym] = data;
            }

            return data;

        },
        add: function (element, fn) {
            this.setup(element)[type + 'Cbs'].add(fn);
        },
        remove: function (elem, fn) {
            const data = elem[sym];

            if (data && data.cbs) {
                data[type + 'Cbs'].remove(fn);

                if (!data.rb_focusenterCbs.has() && !data.rb_focusleaveCbs.has()) {
                    elem.removeEventListener('focus', data.enter, true);
                    elem.removeEventListener('blur', data.leave, true);
                    elem[sym] = null;
                }
            }
        },
    };
});
