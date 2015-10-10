(function(){
	'use strict';
	QUnit.module('rb.ComponentES6');

	var modules = {};
	QUnit.testStart(function(obj){
		if(obj.module != 'rb.ComponentES6'){return;}
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
			module: rb.Component.extend(name, {
				statics: {
					ext1: function(){},
				},
				defaults: {
					initial: 'ext1',
					inherit: 'ext1',
				},
				events: {
					initial: 'ext1',
					inherit: 'ext1',
					override: 'ext1'
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

		class Ext2 extends modules.ext1.module {
			constructor(element){
				super(element);
			}

			static ext2(){

			}

			get getter(){
				return super.getter + 'getterext2';
			}
			set setter(value){
				this._setterSet = value +'ext2';
			}

			overrideMethod(){

			}
		}

		Ext2.defaults = {
			initial: 'ext2',
			inherit2: 'ext2'
		};

		rb.life.register(tmpName, Ext2);

		modules.ext2 = {
			name: tmpName,
			module: Ext2
		};

		addSpy();

		name = tmpName;
		id = rb.getID();
		tmpName = 'simplydummy' + id;

		class Ext3 extends modules.ext2.module {
			constructor(element){
				super(element);
			}

			static get defaults(){
				return {
					initial: 'ext3',
				};
			}

			static get events(){
				return {
					initial: 'ext3',
					override: 'ext3',
					newone: 'ext3'
				};
			}

			static ext3(){

			}

			baseMethod(){

			}

			nfeMethod(){
				super.nfeMethod();
			}
		}

		rb.life.register(tmpName, Ext3);

		modules.ext3 = {
			name: tmpName,
			module: Ext3
		};

		addSpy();
	});

	QUnit.test("rb.Component - inheritance", function( assert ){
		var ext1 = rb.$(document.createElement('div')).rbComponent(modules.ext1.name);
		var ext2 = rb.$(document.createElement('div')).rbComponent(modules.ext2.name);
		var ext3 = rb.$(document.createElement('div')).rbComponent(modules.ext3.name);


		assert.equal(modules.ext1.module.prototype.init.callCount, 3);

		assert.equal(modules.ext1.module.prototype.baseMethod.callCount, 0);
		assert.equal(modules.ext3.module.prototype.baseMethod.callCount, 0);

		ext2.overrideMethod();
		assert.equal(modules.ext1.module.prototype.overrideMethod.callCount, 0);
		assert.equal(modules.ext2.module.prototype.overrideMethod.callCount, 1);

		ext1.overrideMethod();
		assert.equal(modules.ext1.module.prototype.overrideMethod.callCount, 1);
		assert.equal(modules.ext2.module.prototype.overrideMethod.callCount, 1);

		assert.equal(ext1.getter, 'getterext1');
		assert.equal(ext2.getter, 'getterext1getterext2');
		assert.equal(ext3.getter, 'getterext1getterext2');

		ext3.setter = 'test3';
		ext1.setter = 'test';
		assert.equal(ext1._setterSet, 'test');
		assert.equal(ext2._setterSet, null);
		assert.equal(ext3._setterSet, 'test3ext2');
	});

	QUnit.test("rb.Component - inheritance - statics + defaults + events", function( assert ){
		var ext1 = rb.$(document.createElement('div')).rbComponent(modules.ext1.name);
		var ext2 = rb.$(document.createElement('div')).rbComponent(modules.ext2.name);
		var ext3 = rb.$(document.createElement('div')).rbComponent(modules.ext3.name);

		assert.equal(typeof modules.ext1.module.ext1, 'function');
		assert.equal(typeof modules.ext3.module.ext3, 'function');

		assert.equal(modules.ext3.module.events.inherit, 'ext1');
		assert.equal(modules.ext3.module.events.override, 'ext3');
		assert.equal(modules.ext3.module.events.initial, 'ext3');
		assert.equal(modules.ext3.module.events.newone, 'ext3');

		assert.equal(modules.ext2.module.events.inherit, 'ext1');
		assert.equal(modules.ext2.module.events.override, 'ext1');

		assert.equal(modules.ext1.module.events.initial, 'ext1');

		assert.equal(ext3.options.initial, 'ext3', 's');
		assert.equal(ext3.options.inherit, 'ext1');
		assert.equal(ext3.options.inherit2, 'ext2');

		assert.equal(ext1.options.initial, 'ext1');
		assert.equal(ext1.options.inherit, 'ext1');
		assert.equal(ext1.options.inherit2, undefined);

		assert.equal(ext2.options.initial, 'ext2');
		assert.equal(ext2.options.inherit, 'ext1');
		assert.equal(ext2.options.inherit2, 'ext2');

	});

})();
