(function () {
    'use strict';
    QUnit.module('rb-test');

    QUnit.testStart(function (obj) {
        if (obj.module != 'rb-test') {
            return;
        }
        rb.$('#qunit-fixture').html('');
    });

    QUnit.test("rb-test", function (assert) {
        var done = assert.async();

        QUnit.afterAF()
            .then(function () {
                assert.ok('Add your tests!!!');
            })
            .then(done)
        ;
    });

})();
