(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports !== "undefined") {
        factory();
    } else {
        var mod = {
            exports: {}
        };
        factory();
        global.clickArea = mod.exports;
    }
})(this, function () {
    'use strict';

    window.rb.ready.then(function () {

        var supportMouse = typeof window.MouseEvent == 'function';
        var clickAreaSel = '.' + rb.utilPrefix + 'clickarea';
        var clickAreaActionSel = '.' + rb.utilPrefix + 'clickarea' + rb.nameSeparator + 'action';
        var abortSels = 'a[href], a[href] *, button *, ' + clickAreaActionSel + ', ' + clickAreaActionSel + ' *';

        var getSelection = window.getSelection || function () {
            return {};
        };

        var regInputs = /^(?:input|select|textarea|button|a)$/i;

        document.addEventListener('click', function (e) {

            if (e.defaultPrevented || e.button == 2 || regInputs.test(e.target.nodeName || '') || e.target.matches(abortSels)) {
                return;
            }

            var item = e.target.closest(clickAreaSel);
            var link = item && item.querySelector(clickAreaActionSel);

            if (link) {
                var selection = getSelection();

                if (selection.anchorNode && !selection.isCollapsed && item.contains(selection.anchorNode)) {
                    return;
                }

                if (supportMouse && link.dispatchEvent) {
                    var event = new MouseEvent('click', {
                        cancelable: true,
                        bubbles: true,
                        shiftKey: e.shiftKey,
                        altKey: e.altKey,
                        ctrlKey: e.ctrlKey,
                        metaKey: e.metaKey,
                        button: e.button,
                        which: e.which
                    });

                    link.dispatchEvent(event);
                } else if (link.click) {
                    link.click();
                }
            }
        });
    });

    if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
        if (rb.z__clickarea) {
            rb.logError('clickarea should only be added once');
        }
        rb.z__clickarea = true;
    }
});
