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
        global.keyboardfocus = mod.exports;
    }
})(this, function () {
    'use strict';

    var rb = window.rb;

    rb.ready.then(function () {
        var keyboardFocusElem;
        var hasKeyboardFocus = false;
        var isKeyboardBlocked = false;
        var eventOpts = { passive: true, capture: true };
        var root = rb.root;
        var isClass = rb.utilPrefix + 'keyboardfocus';
        var isWithinClass = rb.utilPrefix + 'keyboardfocus' + rb.nameSeparator + 'within';

        var unblockKeyboardFocus = function unblockKeyboardFocus(e) {
            if (e.keyCode == 9) {
                isKeyboardBlocked = false;
            }
        };

        var _removeChildFocus = function _removeChildFocus() {
            if (keyboardFocusElem && keyboardFocusElem != document.activeElement) {
                keyboardFocusElem.classList.remove(isClass);
                keyboardFocusElem = null;
            }
        };

        var removeChildFocus = function removeChildFocus() {
            if (keyboardFocusElem) {
                rb.rAFQueue(_removeChildFocus);
            }
        };

        var _removeKeyBoardFocus = rb.rAF(function () {
            hasKeyboardFocus = false;
            _removeChildFocus();
            root.classList.remove(isWithinClass);
        }, { throttle: true });

        var removeKeyBoardFocus = function removeKeyBoardFocus() {
            isKeyboardBlocked = true;
            if (hasKeyboardFocus) {
                _removeKeyBoardFocus();
            }
        };

        var setKeyboardFocus = rb.rAF(function () {

            if (!isKeyboardBlocked || hasKeyboardFocus) {

                if (keyboardFocusElem != document.activeElement) {
                    _removeChildFocus();

                    keyboardFocusElem = document.activeElement;

                    if (keyboardFocusElem && keyboardFocusElem.classList) {
                        keyboardFocusElem.classList.add(isClass);
                    } else {
                        keyboardFocusElem = null;
                    }
                }

                if (!hasKeyboardFocus) {
                    root.classList.add(isWithinClass);
                }
                hasKeyboardFocus = true;
            }
        }, { throttle: true });

        var pointerEvents = window.PointerEvent ? ['pointerdown', 'pointerup'] : ['mousedown', 'mouseup'];

        root.addEventListener('blur', removeChildFocus, eventOpts);
        root.addEventListener('focus', function () {
            if (!isKeyboardBlocked || hasKeyboardFocus) {
                setKeyboardFocus();
            }
        }, eventOpts);
        root.addEventListener('keydown', unblockKeyboardFocus, eventOpts);
        root.addEventListener('keypress', unblockKeyboardFocus, eventOpts);

        pointerEvents.forEach(function (eventName) {
            document.addEventListener(eventName, removeKeyBoardFocus, eventOpts);
        });
    });

    if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
        if (rb.z__keyboardFocus) {
            rb.logError('keyboardfocus should only be added once');
        }
        rb.z__keyboardFocus = true;
    }
});
