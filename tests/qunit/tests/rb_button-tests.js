(function () {
    'use strict';
    QUnit.module('rb_button');

    var module = {};
    QUnit.testStart(function (obj) {
        if (obj.module != 'rb_button') {
            return;
        }
        var fn;
        var id = rb.getID();
        var name = 'panel' + id;

        var addSpy = function () {
            for (fn in module.component.prototype) {
                if (typeof module.component.prototype[fn] == 'function' && !('getCall' in module.component.prototype[fn])) {
                    sinon.spy(module.component.prototype, fn);
                }
            }
        };



        module = {
            name: name,
            component: rb.live.register(name, class extends rb.Component {
                constructor(element, initDefaults){
                    super(element, initDefaults);
                }

                toggle() {
                    if (this.element.classList.contains('panel-open')) {
                        this.close();
                    } else {
                        this.open();
                    }

                }

                open() {
                    this.element.classList.add('panel-open');
                }

                close() {
                    this.element.classList.remove('panel-open');
                }

                special() {
                    this.element.classList.add('special-panel');
                }

            }),
        };

        addSpy();
    });

    QUnit.test("rb.$", function (assert) {
        var $button, $panel1, $panel2;
        var done = assert.async();
        var content = '<button id="test-button" data-module="button" data-button-target="next()" class="js-rb-click"></button><div id="test-panel1" data-module="' + module.name + '"></div><div id="test-panel2" data-module="' + module.name + '"></div>';

        rb.$('#qunit-fixture').html(content);

        QUnit.afterAF(33).then(function(){
            $button = rb.$('#test-button');
            $panel1 = rb.$('#test-panel1');
            $panel2 = rb.$('#test-panel2');


            $button.get(0).click();

            assert.ok($panel1.get(0).classList.contains('panel-open'));

            assert.equal($panel1.rbComponent().activeButtonComponent, $button.rbComponent());
            assert.equal($button.rbComponent().target, $panel1.get(0));

            assert.notOk($panel2.get(0).classList.contains('panel-open'));

            $button.rbComponent().setOption('target', 'test-panel2');
            $button.get(0).click();

            assert.ok($panel1.get(0).classList.contains('panel-open'));
            assert.ok($panel2.get(0).classList.contains('panel-open'));
            assert.equal($panel2.rbComponent().activeButtonComponent, $button.rbComponent());
            assert.equal($button.rbComponent().target, $panel2.get(0));

            $button.rbComponent().setOption('target', $panel1.get(0));
            $button.rbComponent().setOption('type', 'special');
            $button.get(0).click();

            assert.equal($button.rbComponent().target, $panel1.get(0));
            assert.ok($panel1.get(0).classList.contains('special-panel'));

            QUnit.afterAF()
                .then(function () {
                    assert.equal($button.attr('aria-controls'), $panel1.prop('id'));
                })
                .then(done)
            ;
        });
    });
})();
