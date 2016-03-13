(function () {
    'use strict';
    QUnit.module('{fullName}');

    QUnit.testStart(function (obj) {
        if (obj.module != '{fullName}') {
            return;
        }
        rb.$('#qunit-fixture').html('');
    });

    QUnit.test("{fullName}", function (assert) {
        var done = assert.async();

        QUnit.afterAF()
            .then(function () {
                assert.ok('Add your tests!!!');
            })
            .then(done)
        ;
    });

})();
