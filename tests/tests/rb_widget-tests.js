(function(){
	'use strict';
	QUnit.module('rb.Widget');

	var modules = {};
	QUnit.testStart(function(obj){
		if(obj.module != 'rb.Widget'){return;}
		var fn, tmpName, module;
		var id = rb.getID();
		var name = 'dummy' + id;

		var addSpy = function(){
			for(module in modules){
				for(fn in modules[module].module.prototype){
					if(typeof modules[module].module.prototype[fn] == 'function' && !('getCall' in modules[module].module.prototype[fn])){
						sinon.spy(modules[module].module.prototype, fn);
					}
				}
			}
		};

		modules.ext1 = {
			name: name,
			module: rb.Widget.extend(name, {
				statics: {
					ext1: function(){},
				},
				defaults: {
					initial: 'ext1',
					inherit: 'ext1',
				},
				init: function(element){
					this._super(element);
				},
				baseMethod: function(){

				},
				overrideMethod: function(){

				},
				nfeMethod: function(){

				},
				get getter(){
					return 'getterext1';
				},
				set setter(value){
					this._setterSet = value;
				},
			})
		};

		addSpy();


		id = rb.getID();
		tmpName = 'simplydummy' + id;

		modules.ext2 = {
			name: tmpName,
			module: rb.widgets[name].extend(tmpName, {
				statics: {
					ext2: function(){},
				},
				defaults: {
					initial: 'ext2',
					inherit2: 'ext2'
				},
				init: function(element){
					this._super(element);
				},
				get getter(){
					return this._super() + 'getterext2';
				},
				set setter(value){
					this._setterSet = value +'ext2';
				},
				overrideMethod: function(){

				}
			})
		};

		addSpy();

		name = tmpName;
		id = rb.getID();
		tmpName = 'simplydummy' + id;

		modules.ext3 = {
			name: tmpName,
			module: rb.widgets[name].extend(tmpName, {
				statics: {
					ext3: function(){},
				},
				defaults: {
					initial: 'ext3',
				},
				init: function(element){
					this._super(element);
				},
				baseMethod: function (){
					this._super();
				},
				nfeMethod: function (){
					this.nfeMethod._super.apply(this, arguments);
				},
			})
		};

		addSpy();
	});

	QUnit.test("rb.Widget - inheritance", function( assert ){
		var ext1 = rb.$(document.createElement('div')).rbWidget(modules.ext1.name);
		var ext2 = rb.$(document.createElement('div')).rbWidget(modules.ext2.name);
		var ext3 = rb.$(document.createElement('div')).rbWidget(modules.ext3.name);


		assert.equal(modules.ext1.module.prototype.init.callCount, 3);
		assert.equal(modules.ext2.module.prototype.init.callCount, 2);
		assert.equal(modules.ext3.module.prototype.init.callCount, 1);

		assert.equal(modules.ext1.module.prototype.baseMethod.callCount, 0);
		assert.equal(modules.ext3.module.prototype.baseMethod.callCount, 0);

		ext2.overrideMethod();
		assert.equal(modules.ext1.module.prototype.overrideMethod.callCount, 0);
		assert.equal(modules.ext2.module.prototype.overrideMethod.callCount, 1);

		ext1.overrideMethod();
		assert.equal(modules.ext1.module.prototype.overrideMethod.callCount, 1);
		assert.equal(modules.ext2.module.prototype.overrideMethod.callCount, 1);

		ext3.baseMethod();
		assert.equal(modules.ext1.module.prototype.baseMethod.callCount, 1);
		assert.equal(modules.ext3.module.prototype.baseMethod.callCount, 1);

		ext3.nfeMethod();
		assert.equal(modules.ext1.module.prototype.nfeMethod.callCount, 1);
		assert.equal(modules.ext3.module.prototype.nfeMethod.callCount, 1);

		assert.equal(ext1.getter, 'getterext1');
		assert.equal(ext2.getter, 'getterext1getterext2');
		assert.equal(ext3.getter, 'getterext1getterext2');

		ext3.setter = 'test3';
		ext1.setter = 'test';
		assert.equal(ext1._setterSet, 'test');
		assert.equal(ext2._setterSet, null);
		assert.equal(ext3._setterSet, 'test3ext2');
	});

	QUnit.test("rb.Widget - statics + defaults", function( assert ){
		var ext1 = rb.$(document.createElement('div')).rbWidget(modules.ext1.name);
		var ext2 = rb.$(document.createElement('div')).rbWidget(modules.ext2.name);
		var ext3 = rb.$(document.createElement('div')).rbWidget(modules.ext3.name);

		assert.equal(typeof modules.ext1.module.ext1, 'function');
		assert.equal(typeof modules.ext2.module.ext1, 'undefined');
		assert.equal(typeof modules.ext3.module.ext3, 'function');

		assert.equal(ext3.options.initial, 'ext3');
		assert.equal(ext3.options.inherit, 'ext1');
		assert.equal(ext3.options.inherit2, 'ext2');

		assert.equal(ext1.options.initial, 'ext1');
		assert.equal(ext1.options.inherit, 'ext1');
		assert.equal(ext1.options.inherit2, undefined);

		assert.equal(ext2.options.initial, 'ext2');
		assert.equal(ext2.options.inherit, 'ext1');
		assert.equal(ext2.options.inherit2, 'ext2');

	});


	QUnit.test("rb.Widget - options/setOptions", function( assert ){
		var callCount;
		var array = [1, 2];
		var obj = {foo: 'bar'};
		var ext1 = rb.$(document.createElement('div'))
			.attr({
					'data-number': 1.2,
					'data-array': JSON.stringify(array),
					'data-obj': JSON.stringify(obj),
					'data-string': 'baz',
					'data-true': 'true',
					'data-false': 'false',
					'data-null': 'null',
					'data-number-zero': '0',
					'data-camel-case-foo': 'baz',
				})
			.rbWidget(modules.ext1.name)
		;
		var ext2 = rb.$(document.createElement('div'))
				.attr({
					class: 'css-options',
					'data-axis': 'horizontal',
				})
			;
		rb.$('#qunit-fixture').append(ext2.get(0))

		ext2 = ext2.rbWidget(modules.ext2.name);

		callCount = modules.ext1.module.prototype.setOption.callCount;

		assert.strictEqual(ext1.options.number, 1.2);
		assert.deepEqual(ext1.options.array, array);
		assert.deepEqual(ext1.options.obj, obj);
		assert.equal(ext1.options.string, 'baz');
		assert.equal(ext1.options.initial, 'ext1');
		assert.strictEqual(ext1.options.true, true);
		assert.strictEqual(ext1.options.false, false);
		assert.strictEqual(ext1.options.null, null);
		assert.strictEqual(ext1.options.numberZero, 0);
		assert.equal(ext1.options.camelCaseFoo, 'baz');
		assert.strictEqual(ext1.options.axis, undefined);

		ext1.setOptions({
			camelCaseFoo: '1',
			string: 'baz',
			'true': false,
		});

		assert.equal(modules.ext1.module.prototype.setOption.callCount, callCount + 2);
		assert.equal(ext1.options.camelCaseFoo, '1');

		assert.equal(ext2.options.axis, 'horizontal');
		assert.equal(ext2.options.inputs, 'find(input)');
		assert.strictEqual(ext2.options.max, 100);

	});
})();
