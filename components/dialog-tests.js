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
        global.dialogTests = mod.exports;
    }
})(this, function () {
    'use strict';

    (function () {
        'use strict';

        QUnit.module('rb_dialog');

        QUnit.testStart(function (obj) {
            if (obj.module != 'rb_dialog') {
                return;
            }
            rb.$('#qunit-fixture').html('<div class="rb-dialog js-rb-live" data-module="dialog">' + '<div class="dialog-inner"><p>Content</p>' + '</div>' + '<button type="button" class="dialog-close">Close Dialog</button>' + '</div>');
        });

        QUnit.test('rb_dialog', function (assert) {
            var done = assert.async();
            var component = rb.$('.rb-dialog').rbComponent();

            component.setOption('closeOnBackdropClick', false);
            assert.notOk(component.isOpen);

            component.open();

            assert.ok(component.isOpen);

            QUnit.afterAF(60).then(function () {
                assert.ok(component.$backdrop.get(0).classList.contains('is-open'));
                assert.ok(rb.root.classList.contains('is-open-dialog-within'));
                assert.ok(component.$backdrop.get(0).contains(document.activeElement));
            }).then(function () {
                syn.click(component.$backdrop.get(0));

                return QUnit.afterAF().then(function () {
                    assert.ok(component.isOpen);
                    assert.ok(rb.root.classList.contains('is-open-dialog-within'), 'jo4');
                });
            }).then(function () {
                component.setOption('closeOnBackdropClick', true);
                syn.click(component.$backdrop.get(0));

                return QUnit.afterAF(50).then(function () {
                    assert.notOk(component.isOpen, 'jo');
                    assert.notOk(rb.root.classList.contains('is-open-dialog-within'), 'jo2');
                });
            }).then(function () {
                component.toggle();

                return QUnit.afterAF().then(function () {
                    assert.ok(component.isOpen);
                    assert.ok(component.$backdrop.get(0).classList.contains('is-open'));
                });
            }).then(function () {
                var closeBtn = component.$element.find('.dialog-close').get(0);
                syn.click(closeBtn);

                return QUnit.afterAF().then(function () {
                    assert.notOk(component.isOpen);
                    assert.notOk(component.$backdrop.get(0).classList.contains('is-open'));
                    assert.notOk(rb.root.classList.contains('is-open-dialog-within'));
                });
            }).then(done);
        });

        QUnit.test('rb_dialog event handling', function (assert) {
            var done = assert.async();
            var component = rb.$('.rb-dialog').rbComponent();
            var change = 0;
            var changed = 0;
            var shouldPrevent = false;

            rb.$('.rb-dialog').on('dialogchange', function (e) {
                change++;
                if (shouldPrevent) {
                    e.preventDefault();
                }
            });

            rb.$('.rb-dialog').on('dialogchanged', function () {
                changed++;
            });

            assert.notOk(component.isOpen);

            component.open();

            assert.ok(component.isOpen);

            QUnit.afterAF(99).then(function () {
                assert.equal(change, 1);
                assert.equal(changed, 1);
                assert.ok(component.$backdrop.get(0).classList.contains('is-open'));
                assert.ok(rb.root.classList.contains('is-open-dialog-within'));
                //assert.ok(component.$backdrop.get(0).contains(document.activeElement));
            }).then(function () {
                shouldPrevent = true;
                component.close();

                return QUnit.afterAF().then(function () {
                    assert.equal(change, 2);
                    assert.equal(changed, 1);
                    shouldPrevent = false;
                    assert.ok(component.isOpen);
                    assert.ok(rb.root.classList.contains('is-open-dialog-within'));
                });
            }).then(function () {
                component.close();
                return QUnit.afterAF().then(function () {
                    assert.equal(change, 3);
                    assert.equal(changed, 2);
                    assert.notOk(component.isOpen);
                    assert.notOk(rb.root.classList.contains('is-open-dialog-within'));
                });
            }).then(function () {
                shouldPrevent = true;
                component.toggle();
                return QUnit.afterAF().then(function () {
                    assert.equal(change, 4);
                    assert.equal(changed, 2);
                    assert.notOk(component.isOpen);
                });
            }).then(done);
        });
    })();
});
