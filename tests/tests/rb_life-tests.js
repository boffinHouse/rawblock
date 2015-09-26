(function(){
	'use strict';

	QUnit.module('rb.life');
	var modules = {};
	QUnit.testStart(function(obj){
		if(obj.module != 'rb.life'){return;}
		var fn;
		var id = rb.getID();
		var name = 'dummy' + id;
		modules.dummy = {
			name: name,
			module: rb.Widget.extend(name, {
				init: function(element){
					this._super(element);
				},
				attached: function(){

				},
				detached: function(){

				},
			})
		};

		id = rb.getID();
		name = 'simplydummy' + id;

		modules.simpledummy = {
			name: name,
			module: rb.Widget.extend(name, {
				init: function(element){
					this._super(element);
				}
			})
		};


		for(fn in modules.dummy.module.prototype){
			if(typeof modules.dummy.module.prototype[fn] == 'function'){
				sinon.spy(modules.dummy.module.prototype, fn);
			}
		}

		for(fn in modules.simpledummy.module.prototype){
			if(typeof modules.simpledummy.module.prototype[fn] == 'function'){
				sinon.spy(modules.simpledummy.module.prototype, fn);
			}
		}
	});

	QUnit.test("create", function( assert ){
		var instance;
		var done = assert.async();
		var Dummy = modules.dummy.module;
		var div = document.createElement('div');

		div.className = 'js-rb-life';

		rb.$('#qunit-fixture').append(div);
		instance = rb.life.create(div, Dummy);

		assert.ok(instance === rb.$(div).rbWidget());

		assert.ok(Dummy.prototype.init.calledOnce);

		assert.ok(div.className == 'js-rb-life');

		QUnit.afterAF()
			.then(function(){
				assert.ok(div.classList.contains('js-rb-attached'));
				assert.ok(Dummy.prototype.attached.calledOnce);
				assert.notOk(Dummy.prototype.detached.calledOnce);
			})
			.then(done)
		;
	});

	QUnit.test("findElements", function( assert ){
		var done = assert.async();
		var dummyName = modules.dummy.name;
		var Dummy = modules.dummy.module;
		rb.$('#qunit-fixture').html('<div class="js-rb-life" data-module="'+ dummyName +'"></div>' +
			'<div class="js-rb-life" data-module="'+ dummyName +'"></div>' +
			'<div class="js-rb-life" id="failed-module" data-module="unknown"><div class="js-rb-life" data-module="'+ dummyName +'"></div></div>');

		assert.equal(rb.$('.js-rb-life').length, 4);
		assert.equal(rb.$('.js-rb-attached').length, 0);

		QUnit.afterAF(5)
			.then(function(){
				assert.equal(Dummy.prototype.init.callCount, 3);
				assert.equal(Dummy.prototype.attached.callCount, 3);

				assert.ok(Dummy.prototype.init.calledBefore(Dummy.prototype.attached));
				assert.notOk(Dummy.prototype.detached.calledOnce);

				return QUnit.afterAF()
					.then(function(){
						assert.equal(rb.$('.js-rb-life').length, 0);
						assert.equal(rb.$('.js-rb-attached').length, 3);
					})
					;
			})
			.then(done)
		;
	});

	QUnit.test("destroyWidget", function( assert ){
		var explicitDestroyed, implicitDestroyed;
		var done = assert.async();
		var dummyName = modules.dummy.name;
		var Dummy = modules.dummy.module;
		rb.$('#qunit-fixture').html('<div class="js-rb-life" data-module="'+ dummyName +'"></div>' +
			'<div class="js-rb-life" data-module="'+ dummyName +'"></div>');

		explicitDestroyed = rb.$('#qunit-fixture .js-rb-life').get(0);
		implicitDestroyed = rb.$('#qunit-fixture .js-rb-life').get(1);

		assert.equal(rb.$('.js-rb-life').length, 2);
		assert.equal(rb.$('.js-rb-attached').length, 0);

		QUnit.afterAF(19)
			.then(function(){
				assert.equal(rb.$('.js-rb-life').length, 0);
				assert.equal(rb.$('.js-rb-attached').length, 2);

				assert.equal(Dummy.prototype.init.callCount, 2);
				assert.equal(Dummy.prototype.attached.callCount, 2);

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
			})
			.then(done)
		;
	});

	QUnit.test("getWidget", function( assert ){
		var dummyName = modules.dummy.name;
		var Dummy = modules.dummy.module;
		var simpledummyName = modules.simpledummy.name;
		var simpledummy = modules.simpledummy.module;

		rb.$('#qunit-fixture').html('<div id="m1" class="js-rb-life" data-module="'+ dummyName +'"></div>' +
			'<div id="m2" class="js-rb-life" data-module="'+ simpledummyName +'"></div><div  id="m3" class="js-rb-life" data-module="unknown"></div>');

		assert.equal(rb.$('.js-rb-life').length, 3);
		assert.equal(rb.$('.js-rb-attached').length, 0);

		assert.equal(Dummy.prototype.init.callCount, 0);

		rb.$('#m1').rbWidget();
		assert.equal(Dummy.prototype.init.callCount, 1);
		assert.equal(simpledummy.prototype.init.callCount, 0);
		assert.ok(rb.$('#m1').rbWidget().init);

		rb.$('#m2').rbWidget();
		assert.equal(simpledummy.prototype.init.callCount, 1);
		assert.equal(Dummy.prototype.init.callCount, 1);
		assert.ok(rb.$('#m2').rbWidget().init);

		rb.$('#m3').rbWidget();
		assert.notOk(rb.life.getWidget(rb.$('#m3').get(0)));
		assert.equal(simpledummy.prototype.init.callCount, 1);
		assert.equal(Dummy.prototype.init.callCount, 1);
	});
})();
