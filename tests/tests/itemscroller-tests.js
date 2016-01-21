(function () {
    'use strict';
    QUnit.module('itemscroller');

    var changedEvents = 0;
    var changedCompletedEvents = 0;
    var pagelengthchangedEvents = 0;

    rb.$(document).on('itemscrollerchanged', function () {
        changedEvents++;
    });

    rb.$(document).on('itemscrollerchangedcompleted', function () {
        changedCompletedEvents++;
    });

    rb.$(document).on('itemscrollerpagelengthchanged', function () {
        pagelengthchangedEvents++;
    });

    QUnit.testStart(function (obj) {
        if (obj.module != 'itemscroller') {
            return;
        }

        rb.$('#qunit-fixture').html('<div class="rb-itemscroller" data-module="itemscroller"> ' +
            '<button type="button" class="itemscroller-btn-prev" tabindex="-1" aria-hidden="true">previous</button> ' +
            '<button type="button" class="itemscroller-btn-next" tabindex="-1" aria-hidden="true">next</button> ' +
            '<div class="itemscroller-viewport"> <div class="itemscroller-content is-column-group is-gutter-horizontal"> ' +
            '<div class="itemscroller-cell"> <div class="dummy-item"> 0 <input class="focus-element" /> </div> </div> ' +
            '<div class="itemscroller-cell"> <div class="dummy-item"> 1 </div> </div> ' +
            '<div class="itemscroller-cell"> <div class="dummy-item"> 2 </div> </div> ' +
            '<div class="itemscroller-cell"> <div class="dummy-item"> 3 </div> </div> ' +
            '<div class="itemscroller-cell"> <div class="dummy-item"> 4 </div> </div> ' +
            '<div class="itemscroller-cell"> <div class="dummy-item"> 5 </div> </div> ' +
            '<div class="itemscroller-cell"> <div class="dummy-item"> 6 </div> </div> ' +
            '<div class="itemscroller-cell"> <div class="dummy-item"> 7 </div> </div> ' +
            '<div class="itemscroller-cell"> <div class="dummy-item"> 8 </div> </div> ' +
            '<div class="itemscroller-cell"> <div class="dummy-item"> 9 </div> </div> ' +
            '</div> </div> ' +
            '<div class="itemscroller-pagination"></div> ' +
            '</div>')
        ;
        changedEvents = 0;
        changedCompletedEvents = 0;
        pagelengthchangedEvents = 0;
    });

    QUnit.test("default option + switch into carousel", function (assert) {
        var done = assert.async();
        var component = rb.$('.rb-itemscroller').rbComponent();
        var setPosSpy = sinon.spy(component, 'setPos');

        QUnit.afterAF()
            .then(function () {
                assert.strictEqual(component.baseIndex, 0);
                assert.strictEqual(component.baseLength, 3);
                assert.strictEqual(component.element.querySelectorAll('.itemscroller-pagination-btn').length, 3);
                assert.strictEqual(component._pos, 0);
                assert.strictEqual(component._selectedIndex, 0);
                assert.numberClose(component.carouselWidth, 1000);
                assert.ok(component.isStartReached());
                assert.notOk(component.isEndReached());
                assert.ok(component.element.querySelector('.itemscroller-btn-prev').disabled);
            })
            .then(function () {
                component.selectNext(true);
                return QUnit.afterAF();
            })
            .then(function () {
                assert.strictEqual(component._selectedIndex, 1);
                assert.numberClose(component._pos, -400);
                assert.strictEqual(changedEvents, 1);
                //assert.strictEqual(changedCompletedEvents, 1);
                assert.notOk(component.isStartReached());
                assert.notOk(component.isEndReached());
                assert.notOk(component.element.querySelector('.itemscroller-btn-prev').disabled);
            })
            .then(function () {
                component.selectNext(true);
                return QUnit.afterAF();
            })
            .then(function () {
                assert.strictEqual(component.selectedIndex, 2);
                assert.numberClose(component._pos, -600);
                assert.strictEqual(changedEvents, 2);
                assert.notOk(component.isStartReached());
                assert.ok(component.isEndReached());
                assert.ok(component.element.querySelector('.itemscroller-btn-next').disabled);
            })

            .then(function () {
                component.setOption('carousel', true);
                return QUnit.afterAF();
            })
            .then(function () {
                assert.numberClose(component._pos, -800);
                assert.strictEqual(component.baseIndex, 2);
                assert.notOk(component.isStartReached());
                assert.notOk(component.isEndReached());
                assert.notOk(component.element.querySelector('.itemscroller-btn-next').disabled);
            })
            .then(function () {
                component.selectNext(true);
                return QUnit.afterAF();
            })
            .then(function () {
                assert.numberClose(setPosSpy.lastCall.args[0], -1000);
                assert.numberClose(component._pos, 0);
            })
            .then(function () {
                component.selectPrev(true);
                return QUnit.afterAF();
            })
            .then(function () {
                assert.numberClose(component._pos, 200);
            })
            .then(function () {

                assert.strictEqual(pagelengthchangedEvents, 0);
                component.setOption('carousel', false);
                component.setOption('scrollStep', 2);
                return QUnit.afterAF();
            })
            .then(function () {
                assert.strictEqual(component.baseIndex, 0);
                assert.strictEqual(component.baseLength, 5);
                assert.strictEqual(pagelengthchangedEvents, 1);
                assert.strictEqual(component.element.querySelectorAll('.itemscroller-pagination-btn').length, 4);
            })
            .then(done)
        ;
    });

    QUnit.test("center mode", function (assert) {
        var done = assert.async();
        var component = rb.$('.rb-itemscroller')
            .attr({
                'data-center-mode': 'true',
                'data-selected-index': 1,
                'data-duration': 1,
            })
            .rbComponent()
            ;

        QUnit.afterAF()
            .then(function () {
                assert.strictEqual(changedEvents, 0);
                assert.strictEqual(component.baseLength, 10);
                assert.strictEqual(component.selectedIndex, 1);
                assert.numberClose(component._pos, 50);
            })
            .then(function () {
                rbTest.simulate(component.element.querySelector('.itemscroller-btn-next'), 'click');
                return QUnit.afterAF(20);
            })
            .then(function () {
                assert.strictEqual(component.selectedIndex, 2);
                assert.numberClose(component._pos, -50);
                assert.strictEqual(changedEvents, 1);
            })
            .then(function () {
                rbTest.simulate(component.element.querySelectorAll('.itemscroller-pagination-btn')[9], 'click');
                return QUnit.afterAF(20);
            })
            .then(function () {
                assert.strictEqual(component.selectedIndex, 9);
                assert.numberClose(component._pos, -750);
                assert.strictEqual(changedEvents, 2);
            })
            .then(function () {

                rbTest.simulate(document.querySelector('.itemscroller-viewport'), 'flick', {}, {
                    duration: 60,
                    x: 20,
                    y: 1,
                });

                return QUnit.afterAF(80).then(function () {
                    assert.strictEqual(component.selectedIndex, 8);
                    assert.numberClose(component._pos, -650);
                    assert.strictEqual(changedEvents, 3);
                });
            })

            .then(function () {
                rbTest.simulate(document.querySelector('.itemscroller-viewport'), 'flick', {}, {
                    duration: 60,
                    x: 2,
                    y: 1,
                });

                return QUnit.afterAF(80).then(function () {
                    assert.strictEqual(component.selectedIndex, 8);
                    assert.numberClose(component._pos, -650);
                    assert.strictEqual(changedEvents, 3);
                });
            })
            .then(function () {
                component.element.querySelector('.focus-element').focus();
                return QUnit.afterAF(19);
            })
            .then(function () {
                assert.strictEqual(component.selectedIndex, 0);
                assert.numberClose(component._pos, 150);
            })
            .then(function () {
                component.setOption('carousel', true);
                return QUnit.afterAF();
            })
            .then(function () {
                assert.strictEqual(component.baseIndex, 4);
                assert.ok(component.isWrap);
                assert.ok(component.isCarousel);
            })
            .then(function () {
                syn.click({}, component.element.querySelector('.itemscroller-btn-prev'));
                return QUnit.afterAF(20);
            })
            .then(function () {
                assert.strictEqual(component.selectedIndex, 9);
                assert.numberClose(component._pos, 250);
            })
            .then(function () {
                syn.click({}, component.element.querySelector('.focus-element'));
                return QUnit.afterAF(40);
            })
            .then(function () {
                assert.strictEqual(component.selectedIndex, 9);
            })
            .then(function () {
                component.setOption('switchedOff', true);
                return QUnit.afterAF();
            })
            .then(function () {
                assert.notOk(component.element.querySelector('.itemscroller-cell').style.position == 'absolute');
                assert.notOk(component.element.querySelector('.itemscroller-cell').style.left !== '');
            })
            .then(done)
        ;
    });

    QUnit.test("itemscroller resize", function (assert) {
        var done = assert.async();
        rbTest
            .load('assets/itemscroller-fixture.html')
            .then(function () {
                rbTest.win.rb.life.init();
                var component = rbTest.win.rb.$('.rb-itemscroller')
                    .css({width: '100%'})
                    .rbComponent()
                    ;

                rbTest
                    .wait(66)
                    .then(function () {
                        assert.strictEqual(component.baseLength, 5);
                        assert.strictEqual(component.carouselWidth, 1000);
                    })
                    .resize(600)
                    .wait(301)
                    .then(function () {
                        assert.strictEqual(component.baseLength, 2);
                        assert.numberClose(component.carouselWidth, 1000);
                    })
                    .then(done)
                ;
            })
        ;
    });
})();
