(function () {
    'use strict';
    QUnit.module('panelgroup');


    rb.components.panelgroup.defaults.selectedIndex = 0;
    rb.components.panelgroup.defaults.multiple = false;
    rb.components.panelgroup.defaults.toggle = false;

    QUnit.testStart(function (obj) {
        if (obj.module != 'panelgroup') {
            return;
        }

        rb.$('#qunit-fixture').html(
            '<div class="rb-panelgroup" data-module="panelgroup">' +
            '<button type="button" class="panelgroup-btn">1</button>' +
            '<button type="button" class="panelgroup-btn">2</button>' +
            '<button type="button" class="panelgroup-ctrl-btn" data-type="prev">&lt;</button>' +
            '<button type="button" class="panelgroup-ctrl-btn" data-type="next">&gt;</button>' +
            '<div class="panelgroup-panel">' +
            '{{panelContent}}' +
            '</div>' +
            '<div class="panelgroup-panel">' +
            '{{panelContent}}' +
            '</div>' +
            '</div>'
        );
    });

    QUnit.test('rb-panelgroup selectedIndex: 0', function (assert) {
        var done = assert.async();
        var $panelGroup = rb.$('#qunit-fixture .rb-panelgroup');
        var panelComponent = $panelGroup.rbComponent();

        QUnit.afterAF()
            .then(function () {
                assert.deepEqual(panelComponent.selectedIndexes, [0]);
                assert.ok($panelGroup.find('.panelgroup-panel').get(0).classList.contains('is-open'));
                assert.notOk($panelGroup.find('.panelgroup-panel').get(1).classList.contains('is-open'));
            })
            .then(done)
        ;

    });

    QUnit.test('rb-panelgroup is-open', function (assert) {
        var panelComponent;
        var done = assert.async();
        var $panelGroup = rb.$('#qunit-fixture .rb-panelgroup');

        $panelGroup.find('.panelgroup-panel').eq(1).addClass('is-open');
        panelComponent = $panelGroup.rbComponent();

        QUnit.afterAF()
            .then(function () {
                assert.deepEqual(panelComponent.selectedIndexes, [1]);
                assert.notOk($panelGroup.find('.panelgroup-panel').get(0).classList.contains('is-open'));
                assert.ok($panelGroup.find('.panelgroup-panel').get(1).classList.contains('is-open'));
            })
            .then(done)
        ;
    });

    QUnit.test('rb-panelgroup changed index1', function (assert) {
        var panelComponent;
        var done = assert.async();
        var $panelGroup = rb.$('#qunit-fixture .rb-panelgroup').attr({'data-selected-index': '1'});

        panelComponent = $panelGroup.rbComponent();

        QUnit.afterAF()
            .then(function () {
                assert.deepEqual(panelComponent.selectedIndexes, [1]);
                assert.notOk($panelGroup.find('.panelgroup-panel').get(0).classList.contains('is-open'));
                assert.ok($panelGroup.find('.panelgroup-panel').get(1).classList.contains('is-open'));
            })
            .then(done)
        ;
    });

    QUnit.test('rb-panelgroup changed index2', function (assert) {
        var panelComponent;
        var done = assert.async();
        var $panelGroup = rb.$('#qunit-fixture .rb-panelgroup').attr({'data-selected-index': '-1'});

        panelComponent = $panelGroup.rbComponent();

        QUnit.afterAF()
            .then(function () {
                assert.deepEqual(panelComponent.selectedIndexes, [], 's');
                assert.notOk($panelGroup.find('.panelgroup-panel').get(0).classList.contains('is-open'));
                assert.notOk($panelGroup.find('.panelgroup-panel').get(1).classList.contains('is-open'));
            })
            .then(done)
        ;
    });

    QUnit.test('rb-panelgroup next/prev', function (assert) {
        var done = assert.async();
        var $panelGroup = rb.$('#qunit-fixture .rb-panelgroup');
        var panelComponent = $panelGroup.rbComponent();

        QUnit.afterAF()
            .then(function () {
                assert.deepEqual(panelComponent.selectedIndexes, [0]);
                assert.ok($panelGroup.find('.panelgroup-panel').get(0).classList.contains('is-open'));
                assert.notOk($panelGroup.find('.panelgroup-panel').get(1).classList.contains('is-open'));
            })
            .then(function () {
                panelComponent.next();
                return QUnit.afterAF()
                    .then(function () {
                        assert.deepEqual(panelComponent.selectedIndexes, [1]);
                        assert.notOk($panelGroup.find('.panelgroup-panel').get(0).classList.contains('is-open'));
                        assert.ok($panelGroup.find('.panelgroup-panel').get(1).classList.contains('is-open'));
                    })
                    ;
            })
            .then(function () {
                panelComponent.prev();
                return QUnit.afterAF()
                    .then(function () {
                        assert.deepEqual(panelComponent.selectedIndexes, [0]);
                        assert.ok($panelGroup.find('.panelgroup-panel').get(0).classList.contains('is-open'));
                        assert.notOk($panelGroup.find('.panelgroup-panel').get(1).classList.contains('is-open'));
                    })
                    ;
            })
            .then(done)
        ;
    });

    QUnit.test('rb-panelgroup multiple', function (assert) {
        var done = assert.async();
        var $panelGroup = rb.$('#qunit-fixture .rb-panelgroup').attr({'data-multiple': 'true', 'data-toggle': 'true'});
        var panelComponent = $panelGroup.rbComponent();

        QUnit.afterAF()
            .then(function () {
                assert.deepEqual(panelComponent.selectedIndexes, [0]);
                assert.ok($panelGroup.find('.panelgroup-panel').get(0).classList.contains('is-open'));
                assert.notOk($panelGroup.find('.panelgroup-panel').get(1).classList.contains('is-open'));
            })
            .then(function () {
                panelComponent.selectIndex(1);
                return QUnit.afterAF()
                    .then(function () {
                        assert.deepEqual(panelComponent.selectedIndexes, [0, 1]);
                        assert.ok($panelGroup.find('.panelgroup-panel').get(0).classList.contains('is-open'));
                        assert.ok($panelGroup.find('.panelgroup-panel').get(1).classList.contains('is-open'));
                    })
                    ;
            })
            .then(function () {
                panelComponent.deselectIndex(1);
                return QUnit.afterAF()
                    .then(function () {
                        assert.deepEqual(panelComponent.selectedIndexes, [0]);
                        assert.ok($panelGroup.find('.panelgroup-panel').get(0).classList.contains('is-open'));
                        assert.notOk($panelGroup.find('.panelgroup-panel').get(1).classList.contains('is-open'));
                    })
                    ;
            })
            .then(done)
        ;
    });
})();
