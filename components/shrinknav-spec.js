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
        global.shrinknavSpec = mod.exports;
    }
})(this, function () {
    'use strict';

    var shrinkNavWrapper = void 0;

    var html = '\n    <style>\n        .shrinknav-wrapper {\n            width: 600px;\n        }\n        \n        .shrinknav-item {\n            width: 180px;\n        }\n    </style>\n    <div class="shrinknav" data-module="shrinknav">\n        <div class="shrinknav-item"></div>\n        <div class="shrinknav-item"></div>\n        <div class="shrinknav-item"></div>\n        <div class="shrinknav-item"></div>\n        <div class="shrinknav-item"></div>\n        <div class="shrinknav-item"></div>\n        <div class="shrinknav-item is-toggle-item">\n            <div class="shrinknav-panel">\n    \n            </div>\n        </div>\n    </div>';

    function createShrinkNav() {
        destoryShrinkNav();

        shrinkNavWrapper = document.createElement('div');
        shrinkNavWrapper.innerHTML = html;
        shrinkNavWrapper.className = 'shrinknav-wrapper';

        document.body.appendChild(shrinkNavWrapper);
    }

    function destoryShrinkNav() {
        if (shrinkNavWrapper) {
            shrinkNavWrapper.remove();
            shrinkNavWrapper = null;
        }
    }

    function shrinknavComponent(options) {
        if (options && options.size) {
            shrinkNavWrapper.style.width = typeof options.size == 'number' ? options.size + 'px' : options.size;
            delete options.size;
        }
        return rb.$(shrinkNavWrapper).find('.shrinknav').rbComponent('shrinknav', options);
    }

    describe('shrinknav', function () {
        beforeEach(function () {
            createShrinkNav();
        });

        it('render shrinkNav with default options', function (done) {
            var shrinkNav = shrinknavComponent();

            rbTest.wait().then(function () {
                expect(shrinkNav.mainbarItems.length).toEqual(2);
                done();
            });
        });
    });
});
