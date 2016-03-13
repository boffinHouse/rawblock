//var casperHelpers = require('../../../../../tests/visual/casper-helpers');
//
//casper.thenOpen(casperHelpers.root + 'test-{name}_page.html')
//    .then(function() {
//        var promise = casperHelpers.deferred();
//
//        casper.waitFor(casperHelpers.waitForJsReady(), function(){
//
//            phantomcss.screenshot('#test-1', '{name}-default');
//
//            casper.wait(9, function () {
//                casper.click('#test-1 .{name}-btn-next');
//                casper.wait(66, function () {
//                    phantomcss.screenshot('#test-1', '{name}-clicked');
//                    promise._resolve();
//                });
//            });
//
//        });
//
//        return promise;
//    })
//;
