(function(){
	'use strict';
	QUnit.module('rbutils');

	QUnit.test("rb.elementFromStr", function( assert ){
		var mainElement, tmp;
		var content = '<div id="test-wrapper">' +
			'<div class="children-1 first" id="test-id2"></div><div class="children-2"><div id="test-id6" class="childrens-child"></div></div><div class="children-3 last" id="test-id3"></div>' +
			'</div>';

		rb.$('#qunit-fixture').html(content);
		mainElement = document.querySelector('#test-wrapper');

		tmp = rb.elementFromStr('test-id2 test-id3', mainElement);

		assert.equal(tmp.length, 2);
		assert.equal(tmp[0], document.querySelector('#test-id2'));

		tmp = rb.elementFromStr('children()', mainElement);

		assert.equal(tmp.length, 3);
		assert.equal(tmp[0], document.querySelector('#test-id2'));
		assert.equal(tmp[2], document.querySelector('#test-id3'));

		tmp = rb.elementFromStr('children(.children-2)', mainElement);
		assert.equal(tmp.length, 1);

		tmp = rb.elementFromStr('nextAll(.last)', document.querySelector('#test-id2'));
		assert.equal(tmp[0], document.querySelector('#test-id3'));

		tmp = rb.elementFromStr('prevAll(.first)', document.querySelector('#test-id3'));
		assert.equal(tmp[0], document.querySelector('#test-id2'));


		tmp = rb.elementFromStr('closestFind(#test-wrapper, .children-1)', document.querySelector('#test-id6'));
		assert.equal(tmp[0], document.querySelector('#test-id2'));

		tmp = rb.elementFromStr('closest(#test-wrapper)', document.querySelector('.childrens-child'));
		assert.equal(tmp[0], document.querySelector('#test-wrapper'));

		tmp = rb.elementFromStr('parent(.children-2)', document.querySelector('.childrens-child'));
		assert.equal(tmp[0], rb.elementFromStr('parent()', document.querySelector('.childrens-child'))[0]);
		assert.equal(tmp[0], document.querySelector('.childrens-child').parentNode);

		tmp = rb.elementFromStr('parent(.very-unknown)', document.querySelector('.childrens-child'));
		assert.equal(tmp.length, 0);

		tmp = rb.elementFromStr('next()', document.querySelector('#test-id2'));
		assert.equal(tmp[0], document.querySelector('.children-2'));

		tmp = rb.elementFromStr('prev(.children-2)', document.querySelector('#test-id3'));
		assert.equal(tmp[0], document.querySelector('.children-2'));
	});

	QUnit.test("rb.throttle", function( assert ){
		var done = assert.async();
		var i = 0;
		var fn = rb.throttle(function(){
			i++;
		}, {delay: 9});

		setTimeout(fn, 1);
		fn();
		fn();

		QUnit.afterAF(9)
			.then(function(){
				assert.equal(i, 1);
			})
			.then(function(){
				setTimeout(fn, 1);
				fn();
				fn();
				QUnit.afterAF(30).then(function(){
					assert.equal(i, 2);
				})
			})
			.then(done)
		;
	});

	QUnit.test("rb.resize", function( assert ){
		var fn = rb.$.noop;

		sinon.spy(rb.resize, '_setup');
		sinon.spy(rb.resize, '_teardown');
		sinon.spy(rb.resize, 'add');
		sinon.spy(rb.resize, 'remove');

		assert.equal(rb.resize._setup.callCount, 0);
		assert.equal(rb.resize.add.callCount, 0);
		assert.equal(rb.resize._teardown.callCount, 0);

		rb.resize.on(fn);

		assert.equal(rb.resize._setup.callCount, 1);
		assert.equal(rb.resize.add.callCount, 1);
		assert.equal(rb.resize._teardown.callCount, 0);

		rb.resize.off(fn);

		assert.equal(rb.resize._setup.callCount, 1);
		assert.equal(rb.resize.add.callCount, 1);
		assert.equal(rb.resize._teardown.callCount, 1);
		assert.equal(rb.resize.remove.callCount, 1);

		rb.resize._setup.restore();
		rb.resize.add.restore();
		rb.resize._teardown.restore();
		rb.resize.remove.restore();
	});

	QUnit.test("rb.cssConfig", function( assert ){
		var config = rb.cssConfig;

		assert.equal(config.currentMQ, 's');
		assert.deepEqual(config.extras, {test: "foo"});
		assert.deepEqual(config.mqs,  {l: "(min-width: 1240px)", m: "(min-width: 569px) and (max-width: 1239px)", s: "(max-width: 568px)"});

	});

	QUnit.test("rb.getCSSNumbers", function( assert ){
		var $mainElement, tmp;
		var content = '<div id="test-wrapper" style="border: 5px solid #000; width: 300px;"></div>';

		rb.$('#qunit-fixture').html(content);
		$mainElement = rb.$('#test-wrapper');
		$mainElement.css({marginLeft: '50px', marginRight: '-20px', paddingTop: '20px'});

		assert.numberClose(rb.getCSSNumbers($mainElement.get(0), ['marginLeft', 'margin-right', 'paddingTop', 'borderBottomWidth']), 55, 4);
		assert.numberClose(rb.getCSSNumbers($mainElement.get(0), ['marginLeft', 'margin-right', 'paddingTop', 'borderBottomWidth'], true), 75, 4);

	});

	QUnit.test("rb. $.rbSlideUp / $.rbSlideDown", function( assert ){
		var $mainElement;
		var done = assert.async();
		var cbs = {
			complete: 0,
			always: 0,
		};
		var onComplete = function(){
			cbs.complete++;
		};
		var onAlways = function(){
			cbs.always++;
		};
		var content = '<div id="test-wrapper" style="display: none; visibility: hidden;">' +
			'<div style="height: 300px"></div>' +
			'</div>';

		rb.$('#qunit-fixture').html(content);

		$mainElement = rb.$('#test-wrapper');

		$mainElement.rbSlideDown({
			duration: 9,
			complete: onComplete,
			always: onAlways,
		});

		QUnit.afterAF(9)
			.then(function(){
				assert.numberClose($mainElement.get(0).offsetHeight, 300, 9);
				assert.equal(cbs.complete, 1);
				assert.equal(cbs.always, 1);
				assert.ok($mainElement.css('visibility') != 'hidden');
			})
			.then(function(){
				$mainElement.rbSlideUp({
					duration: 9,
					complete: onComplete,
					always: onAlways,
				});
				return QUnit.afterAF(9)
					.then(function(){
						assert.numberClose($mainElement.get(0).offsetHeight, 0, 9);
						assert.equal(cbs.complete, 2);
						assert.equal(cbs.always, 2);
					})
				;
			})
			.then(done)
		;
	});

	QUnit.test("rb.elementResize", function( assert ){
		var done = assert.async();
		var $mainElement;
		var i = 0;
		var fn = function(){
			i++;
		};
		var content = '<div id="test-wrapper" style="position: relative; width: 300px; height: 30px;">' +
			'<div style="height: 100%"></div>' +
			'</div>';

		rb.$('#qunit-fixture').html(content);

		$mainElement = rb.$('#test-wrapper');
		$mainElement.find('div').elementResize('add', fn);
		assert.equal(i, 0);

		QUnit.afterAF(19)
			.then(function(){
				return QUnit.afterAF(9);
			})
			.then(function(){
				$mainElement.css({width: '350px'});
				return QUnit.afterAF(209).then(function(){
					assert.equal(i, 1);
				});
			})
			.then(function(){

				$mainElement.css({width: '50px'});
				return QUnit.afterAF(209).then(function(){
					assert.equal(i, 2);
				});
			})
			.then(function(){
				$mainElement.css({height: '250px'});
				return QUnit.afterAF(209).then(function(){
					assert.equal(i, 3);
				});
			})
			.then(done)
		;
	});


	QUnit.test("rb. .is-teaser delegate", function( assert ){
		var $mainElement;
		var i = 0;
		var ni = 0;
		var mainI = 0;
		var fn = function(e){
			i++;
		};
		var nfn = function(e){
			ni++;
		};
		var mainFn = function(){
			mainI++;
		};
		var content = '<div id="test-wrapper" class="is-teaser">' +
			'<a class="is-teaser-link">ssas</a>' +
			'</div>';

		if(!window.MouseEvent || typeof MouseEvent != 'function'){
			assert.ok(true);
			return;
		}

		rb.$('#qunit-fixture').html(content);

		$mainElement = rb.$('#test-wrapper');

		$mainElement.on('click', mainFn);
		window.addEventListener('click', fn, true);
		$mainElement.find('.is-teaser-link').on('click', nfn);

		rbTest.simulate($mainElement.get(0), 'click');

		assert.equal(i, 1);
		assert.equal(ni, 0);
		assert.equal(mainI, 1);

		rbTest.simulate($mainElement.find('.is-teaser-link').get(0), 'click');

		assert.equal(i, 2);
		assert.equal(ni, 1);
		assert.equal(mainI, 2);


		$mainElement.off('click', mainFn);
		window.removeEventListener('click', fn, true);
		$mainElement.find('.is-teaser-link').off('click', nfn);
	});

	QUnit.test("rb. $.scrollIntoView", function( assert ){
		var $mainElement, position;
		var done = assert.async();
		var cbs = {
			complete: 0,
			always: 0,
		};
		var onComplete = function(){
			cbs.complete++;
		};
		var onAlways = function(){
			cbs.always++;
		};
		var content = '<div id="test-wrapper" style="height: 99999px">' +
			'<div id="posed-element" style="position: relative; top: 9999px;"></div>' +
			'</div>';

		rb.$('body').append(content);

		$mainElement = rb.$('#posed-element');

		position = $mainElement.get(0).getBoundingClientRect();

		if(position.top < 9){
			assert.ok(true);
			done();
			return;
		}

		$mainElement.scrollIntoView({
			duration: 9,
			complete: onComplete,
			always: onAlways,
		});

		QUnit.afterAF(9)
			.then(function(){
				var position = $mainElement.get(0).getBoundingClientRect();
				assert.numberClose(position.top, 0, 9);
				assert.equal(cbs.complete, 1);
				assert.equal(cbs.always, 1);
			})
			.then(function(){
				$mainElement.scrollIntoView({
					duration: 9,
					offsetTop: -50,
					complete: onComplete,
					always: onAlways,
				});
				return QUnit.afterAF(9)
					.then(function(){
						var position = $mainElement.get(0).getBoundingClientRect();
						assert.numberClose(position.top, 50, 9);
						assert.equal(cbs.complete, 2);
						assert.equal(cbs.always, 2);
					});
			})
			.then(function(){
				rb.$('#test-wrapper').remove();
			})
			.then(done)
		;
	});
})();
