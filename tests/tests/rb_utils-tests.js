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

		tmp = rb.elementFromStr('firstOfNext(.last)', document.querySelector('#test-id2'));
		assert.equal(tmp[0], document.querySelector('#test-id3'));

		tmp = rb.elementFromStr('firstOfPrev(.first)', document.querySelector('#test-id3'));
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
})();
