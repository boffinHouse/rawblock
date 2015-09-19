(function(){
	'use strict';

	QUnit.module('rb.life');

	QUnit.begin(function(){
		rb.life.init();
	});

	QUnit.testStart(function(){
		var fn;
		var Dummy = rb.Widget.extend('dummy', {
			init: function(element){
				this._super(element);
			},
			attached: function(){

			},
			detached: function(){

			},
			attachedOnce: function(){

			}
		});

		var SimpleDummy = rb.Widget.extend('simpledummy', {
			init: function(element){
				this._super(element);
			}
		});

		for(fn in Dummy.prototype){
			if(typeof Dummy.prototype[fn] == 'function'){
				sinon.spy(Dummy.prototype, fn);
			}
		}

		for(fn in SimpleDummy.prototype){
			if(typeof SimpleDummy.prototype[fn] == 'function'){
				sinon.spy(SimpleDummy.prototype, fn);
			}
		}
	});

	QUnit.test("create", function( assert ){
		var instance, target;
		var events = 0;
		var done = assert.async();
		var Dummy = rb.widgets.dummy;
		var div = document.createElement('div');
		var onDummy = function(e){
			events++;
			target = e.target;
		};

		rb.$(document).on('dummycreated', onDummy);

		div.className = 'js-rb-life';

		rb.$('#qunit-fixture').append(div);
		instance = rb.life.create(div, Dummy);

		assert.ok(instance === rb.$(div).rbWidget(), 'test');

		assert.ok(Dummy.prototype.init.calledOnce);

		assert.notOk(Dummy.prototype.attached.calledOnce);
		assert.notOk(Dummy.prototype.detached.calledOnce);

		assert.ok(div.className == 'js-rb-life');

		QUnit.afterAF()
			.then(function(){
				rb.$(document).off('dummycreated', onDummy);
				assert.ok(div.classList.contains('js-rb-attached'));
				assert.ok(Dummy.prototype.attached.calledOnce);
				assert.strictEqual(events, 1);
				assert.equal(target, div);
				assert.notOk(Dummy.prototype.detached.calledOnce);
			})
			.then(done)
		;
	});

	QUnit.test("findElements", function( assert ){
		var done = assert.async();
		var Dummy = rb.widgets.dummy;
		rb.$('#qunit-fixture').html('<div class="js-rb-life" data-module="dummy"></div>' +
			'<div class="js-rb-life" data-module="dummy"></div>' +
			'<div class="js-rb-life" id="failed-module" data-module="unknown"><div class="js-rb-life" data-module="dummy"></div></div>');

		assert.equal(rb.$('.js-rb-life').length, 4);
		assert.equal(rb.$('.js-rb-attached').length, 0);

		QUnit.afterAF(5)
			.then(function(){
				assert.equal(rb.$('.js-rb-life').length, 0);
				assert.equal(rb.$('.js-rb-attached').length, 3);

				assert.equal(Dummy.prototype.init.callCount, 3);
				assert.equal(Dummy.prototype.attached.callCount, 3);

				assert.ok(Dummy.prototype.init.calledBefore(Dummy.prototype.attached));
				assert.notOk(Dummy.prototype.detached.calledOnce);
			})
			.then(done)
		;
	});

	QUnit.test("destroyWidget", function( assert ){
		var explicitDestroyed, implicitDestroyed;
		var done = assert.async();
		var Dummy = rb.widgets.dummy;
		rb.$('#qunit-fixture').html('<div class="js-rb-life" data-module="dummy"></div>' +
			'<div class="js-rb-life" data-module="dummy"></div>');

		explicitDestroyed = rb.$('#qunit-fixture .js-rb-life').get(0);
		implicitDestroyed = rb.$('#qunit-fixture .js-rb-life').get(1);

		assert.equal(rb.$('.js-rb-life').length, 2);
		assert.equal(rb.$('.js-rb-attached').length, 0);

		QUnit.afterAF(9)
			.then(function(){
				assert.equal(rb.$('.js-rb-life').length, 0);
				assert.equal(rb.$('.js-rb-attached').length, 2);

				assert.equal(Dummy.prototype.init.callCount, 2);
				assert.equal(Dummy.prototype.attached.callCount, 2);
				assert.equal(Dummy.prototype.attachedOnce.callCount, 2);

				assert.ok(Dummy.prototype.init.calledBefore(Dummy.prototype.attached));
				assert.notOk(Dummy.prototype.detached.calledOnce);

				rb.life.destroyWidget(rb.life.getWidget(explicitDestroyed));

				rb.$(implicitDestroyed).detach();
				rb.$(explicitDestroyed).detach();

				assert.ok(Dummy.prototype.detached.calledOnce);

				return QUnit.afterAF(140);
			})
			.then(function(){
				assert.equal(Dummy.prototype.init.callCount, 2);
				assert.equal(Dummy.prototype.attached.callCount, 2);
				assert.equal(Dummy.prototype.detached.callCount, 2);

				assert.notOk(explicitDestroyed.classList.contains('js-rb-life'));
				assert.ok(implicitDestroyed.classList.contains('js-rb-life'));

				rb.$('#qunit-fixture').append(implicitDestroyed);
				rb.$('#qunit-fixture').append(explicitDestroyed);
				return QUnit.afterAF(9);
			})
			.then(function(){
				assert.equal(Dummy.prototype.init.callCount, 2);
				assert.equal(Dummy.prototype.attached.callCount, 3);
				assert.equal(Dummy.prototype.detached.callCount, 2);
				assert.equal(Dummy.prototype.attachedOnce.callCount, 2);
			})
			.then(done)
		;
	});

	QUnit.test("getWidget", function( assert ){
		assert.ok('todo');
	});

	QUnit.module('rb.Widget');
})();
