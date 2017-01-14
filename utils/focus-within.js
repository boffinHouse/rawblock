const rb = window.rb;

rb.ready.then(()=> {
    let running = false;

    const isClass = rb.utilPrefix + 'focus' + rb.nameSeparator + 'within';
    const isClassSelector = '.' + isClass;

    const updateFocus = function () {
        let oldFocusParents, newFocusParents, i, len;

        let parent = document.activeElement;

        if(parent){
            newFocusParents = [];

            while (parent && parent.classList && !parent.classList.contains(isClass)) {
                newFocusParents.push(parent);
                parent = parent.parentNode;
            }

            if ((oldFocusParents = parent.querySelectorAll && parent.querySelectorAll(isClassSelector))) {
                for (i = 0, len = oldFocusParents.length; i < len; i++) {
                    oldFocusParents[i].classList.remove(isClass);
                }
            }
            for (i = 0, len = newFocusParents.length; i < len; i++) {
                newFocusParents[i].classList.add(isClass);
            }
        }

        running = false;
    };

    const update = function () {
        if (!running) {
            running = true;
            rb.rAFQueue(updateFocus, true);
        }
    };

    document.addEventListener('focus', update, true);
    document.addEventListener('blur', update, true);
    update();
});

if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
    if(rb.z__focuswithin){
        rb.logError('focuswithin should only be added once');
    }
    rb.z__focuswithin = true;
}
