(function(){
	'use strict';
	var fixtureHTML = document.getElementById('qunit-fixture').innerHTML;

	QUnit.testDone(function() {
		document.getElementById('qunit-fixture').innerHTML = fixtureHTML;
	});

	QUnit.config.urlConfig.push({
		id: "jqueryinsteadrb",
		label: "jQuery instead of rb.$",
		tooltip: "Test with latest jQuery instead of rawblocks own dom helper."
	});

	QUnit.afterAF = function(cb, delay){
		if(typeof cb == 'number'){
			delay = cb;
			cb = false;
		}

		var promise = new Promise(function(resolve){
			var resolveIt = function(){
				resolve();
				if(cb){
					cb();
				}
			};
			var afterFrame = function(){
				requestAnimationFrame(function(){
					setTimeout(resolveIt);
				});
			};

			if(delay){
				setTimeout(afterFrame, delay);
			} else {
				afterFrame();
			}
		});

		return promise;
	};
})();
