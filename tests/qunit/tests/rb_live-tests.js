(function(){
	'use strict';

	QUnit.module('rb.live');
	var modules = {};
	QUnit.testStart(function(obj){
		if(obj.module != 'rb.live'){return;}
		var fn;
		var id = rb.getID();
		var name = 'dummy' + id;
		modules.dummy = {
			name: name,
			module: rb.Component.extend(name, {
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
			module: rb.Component.extend(name, {
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

		div.className = 'js-rb-live';

		rb.$('#qunit-fixture').append(div);
		instance = rb.live.create(div, Dummy);

		assert.ok(instance === rb.$(div).rbComponent());

		assert.ok(Dummy.prototype.init.calledOnce);

		assert.ok(div.className == 'js-rb-live');

		QUnit.afterAF()
			.then(function(){
				assert.ok(div.classList.contains('js-rb-attached'));
				assert.ok(Dummy.prototype.attached.calledOnce);
				assert.notOk(Dummy.prototype.detached.calledOnce);
			})
			.then(done)
		;
	});

	QUnit.test("click create", function( assert ){
		var done = assert.async();
		var Dummy = modules.dummy.module;
		var name = modules.dummy.name;
		var div = document.createElement('div');

		div.className = 'js-rb-click';
		div.setAttribute('data-module', name);

		rb.$('#qunit-fixture').append(div);

		assert.notOk(Dummy.prototype.attached.calledOnce);

		if(div.click){
			div.click();
		} else {
			rb.$(div).trigger('click');
		}

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
		rb.$('#qunit-fixture').html('<div class="js-rb-live" data-module="'+ dummyName +'"></div>' +
			'<div class="js-rb-live" data-module="'+ dummyName +'"></div>' +
			'<div class="js-rb-live" id="failed-module" data-module="unknown"><div class="js-rb-live" data-module="'+ dummyName +'"></div></div>');

		assert.equal(rb.$('.js-rb-live').length, 4);
		assert.equal(rb.$('.js-rb-attached').length, 0);

		QUnit.afterAF(50)
			.then(function(){
				assert.equal(Dummy.prototype.init.callCount, 3);
				assert.equal(Dummy.prototype.attached.callCount, 3);

				assert.ok(Dummy.prototype.init.calledBefore(Dummy.prototype.attached));
				assert.notOk(Dummy.prototype.detached.calledOnce);

				return QUnit.afterAF(66)
					.then(function(){
						assert.equal(rb.$('.js-rb-live').length, 0);
						assert.equal(rb.$('.js-rb-attached').length, 3);
					})
					;
			})
			.then(done)
		;
	});

	QUnit.test("destroyComponent", function( assert ){
		var explicitDestroyed, implicitDestroyed;
		var done = assert.async();
		var dummyName = modules.dummy.name;
		var Dummy = modules.dummy.module;
		rb.$('#qunit-fixture').html('<div class="js-rb-live" data-module="'+ dummyName +'"></div>' +
			'<div class="js-rb-live" data-module="'+ dummyName +'"></div>');

		explicitDestroyed = rb.$('#qunit-fixture .js-rb-live').get(0);
		implicitDestroyed = rb.$('#qunit-fixture .js-rb-live').get(1);

		assert.equal(rb.$('.js-rb-live').length, 2);
		assert.equal(rb.$('.js-rb-attached').length, 0);

		QUnit.afterAF(59)
			.then(function(){
				assert.equal(rb.$('.js-rb-live').length, 0);
				assert.equal(rb.$('.js-rb-attached').length, 2);

				assert.equal(Dummy.prototype.init.callCount, 2);
				assert.equal(Dummy.prototype.attached.callCount, 2);

				assert.ok(Dummy.prototype.init.calledBefore(Dummy.prototype.attached));
				assert.notOk(Dummy.prototype.detached.calledOnce);

				rb.live.destroyComponent(rb.live.getComponent(explicitDestroyed));

				rb.$(implicitDestroyed).detach();
				rb.$(explicitDestroyed).detach();

				assert.ok(Dummy.prototype.detached.calledOnce);

				return QUnit.afterAF(140);
			})
			.then(function(){
				assert.equal(Dummy.prototype.init.callCount, 2);
				assert.equal(Dummy.prototype.attached.callCount, 2);
				assert.equal(Dummy.prototype.detached.callCount, 2);

				assert.notOk(explicitDestroyed.classList.contains('js-rb-live'));
				assert.ok(implicitDestroyed.classList.contains('js-rb-live'));

				rb.$('#qunit-fixture').append(implicitDestroyed);
				rb.$('#qunit-fixture').append(explicitDestroyed);
				return QUnit.afterAF(30);
			})
			.then(function(){
				assert.equal(Dummy.prototype.init.callCount, 2);
				assert.equal(Dummy.prototype.attached.callCount, 3);
				assert.equal(Dummy.prototype.detached.callCount, 2);
			})
			.then(done)
		;
	});

	QUnit.test("getComponent", function( assert ){
		var dummyName = modules.dummy.name;
		var Dummy = modules.dummy.module;
		var simpledummyName = modules.simpledummy.name;
		var simpledummy = modules.simpledummy.module;

		rb.$('#qunit-fixture').html('<div id="m1" class="js-rb-live" data-module="'+ dummyName +'"></div>' +
			'<div id="m2" class="js-rb-live" data-module="'+ simpledummyName +'"></div><div  id="m3" class="js-rb-live" data-module="unknown"></div>');

		assert.equal(rb.$('.js-rb-live').length, 3);
		assert.equal(rb.$('.js-rb-attached').length, 0);

		assert.equal(Dummy.prototype.init.callCount, 0);

		rb.$('#m1').rbComponent();
		assert.equal(Dummy.prototype.init.callCount, 1);
		assert.equal(simpledummy.prototype.init.callCount, 0);
		assert.ok(rb.$('#m1').rbComponent().init);

		rb.$('#m2').rbComponent();
		assert.equal(simpledummy.prototype.init.callCount, 1);
		assert.equal(Dummy.prototype.init.callCount, 1);
		assert.ok(rb.$('#m2').rbComponent().init);

		rb.$('#m3').rbComponent();
		assert.notOk(rb.live.getComponent(rb.$('#m3').get(0)));
		assert.equal(simpledummy.prototype.init.callCount, 1);
		assert.equal(Dummy.prototype.init.callCount, 1);
	});
})();
