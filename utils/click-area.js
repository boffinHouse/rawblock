window.rb.ready.then(()=>{

    const supportMouse = typeof window.MouseEvent == 'function';
    const clickAreaSel = '.' + rb.utilPrefix + 'clickarea';
    const clickAreaActionSel = '.' + rb.utilPrefix + 'clickarea' + rb.nameSeparator + 'action';
    const abortSels = 'a[href], a[href] *, button *, ' + clickAreaActionSel + ', ' + clickAreaActionSel + ' *';

    const getSelection = window.getSelection || function () {
        return {};
    };

    const regInputs = /^(?:input|select|textarea|button|a)$/i;

    document.addEventListener('click', function (e) {

        if (e.defaultPrevented || e.button == 2 || regInputs.test(e.target.nodeName || '') || e.target.matches(abortSels)) {
            return;
        }

        const item = e.target.closest(clickAreaSel);
        const link = item && item.querySelector(clickAreaActionSel);

        if (link) {
            const selection = getSelection();

            if (selection.anchorNode && !selection.isCollapsed && item.contains(selection.anchorNode)) {
                return;
            }

            if (supportMouse && link.dispatchEvent) {
                const event = new MouseEvent('click', {
                    cancelable: true,
                    bubbles: true,
                    shiftKey: e.shiftKey,
                    altKey: e.altKey,
                    ctrlKey: e.ctrlKey,
                    metaKey: e.metaKey,
                    button: e.button,
                    which: e.which,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    pageX: e.pageX,
                    pageY: e.pageY,
                });

                link.dispatchEvent(event);
            } else if (link.click) {
                link.click();
            }
        }
    });
});


if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
    if(rb.z__clickarea){
        rb.logError('clickarea should only be added once');
    }
    rb.z__clickarea = true;
}
