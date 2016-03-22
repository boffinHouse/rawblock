var casperHelpers = require('../../../../../tests/visual/casper-helpers');

casper.thenOpen(casperHelpers.root + 'test-itemscroller_page.html')
    .then(function() {
        var promise = casperHelpers.deferred();

        casper.waitFor(casperHelpers.waitForJsReady(), function(){
            casperHelpers.disableFx();

            phantomcss.screenshot('#test-1', 'itemscroller-default');

            casper.wait(9, function () {
                casper.click('#test-1 .itemscroller-btn-next');

                casper.wait(66, function () {
                    phantomcss.screenshot('#test-1', 'itemscroller-clicked');
                    promise._resolve();
                });
            });

        });

        return promise;
    })
;
