(function(){
	'use strict';
	QUnit.module('rb.Widget');

	var modules = {};
	QUnit.testStart(function(obj){
		if(obj.module != 'rb.Widget'){return;}
		var fn, tmpName, module;
		var id = rb.getID();
		var name = 'ext1' + id;

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
				events: {
					initial: 'ext1',
					inherit: 'ext1',
					override: 'ext1',
					'click': 'click',
					'delegateevent .delegate': function(){
						this.click();
					}
				},
				init: function(element){
					this._super(element);
				},
				baseMethod: function(){

				},
				click: function(){

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
		tmpName = 'ext2' + id;

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
		tmpName = 'ext3' + id;

		modules.ext3 = {
			name: tmpName,
			module: rb.widgets[name].extend(tmpName, {
				statics: {
					ext3: function(){},
				},
				defaults: {
					initial: 'ext3',
				},
				events: {
					initial: 'ext3',
					override: 'ext3',
					newone: 'ext3',
				},
				init: function(element){
					this._super(element);
				},
				baseMethod: function (){
					this._super();
				},
				nfeMethod: function nfeMethod(){
					nfeMethod._supbase.apply(this, arguments);
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

	QUnit.test("rb.Widget - inheritance - statics + defaults + events", function( assert ){
		var ext1 = rb.$(document.createElement('div')).rbWidget(modules.ext1.name);
		var ext2 = rb.$(document.createElement('div')).rbWidget(modules.ext2.name);
		var ext3 = rb.$(document.createElement('div')).rbWidget(modules.ext3.name);

		assert.equal(typeof modules.ext1.module.ext1, 'function');
		assert.equal(typeof modules.ext2.module.ext1, 'undefined');
		assert.equal(typeof modules.ext3.module.ext3, 'function');

		assert.equal(modules.ext3.module.events.inherit, 'ext1');
		assert.equal(modules.ext3.module.events.override, 'ext3');
		assert.equal(modules.ext3.module.events.initial, 'ext3');
		assert.equal(modules.ext3.module.events.newone, 'ext3');

		assert.equal(modules.ext2.module.events.inherit, 'ext1');
		assert.equal(modules.ext2.module.events.override, 'ext1');

		assert.equal(modules.ext1.module.events.initial, 'ext1');

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

	QUnit.test("rb.Widget - events setup", function( assert ){
		var ext2Instance;

		var ext2elem = rb.$(document.createElement('div')).html('<div class="delegate"></div>');
		rb.$('#qunit-fixture').append(ext2elem.get(0));

		ext2Instance = ext2elem.rbWidget(modules.ext2.name);

		assert.equal(ext2Instance.click.callCount, 0);

		ext2elem.trigger('click');

		assert.equal(ext2Instance.click.callCount, 1);

		ext2elem.trigger('delegateevent');
		assert.equal(ext2Instance.click.callCount, 1);

		ext2elem.find('.delegate').trigger('delegateevent');
		assert.equal(ext2Instance.click.callCount, 2);
	});

	QUnit.test("rb.Widget - getId", function( assert ){
		var ext2Instance;

		var tmpId;
		var id = 'jo';
		var ext2elem = rb.$(document.createElement('div')).html('<div class="has-no-id"><div id="' + id +'" class="has-id"></div></div>');
		var hasIdElem = ext2elem.find('.has-id').get(0);
		var hasNoIdElem = ext2elem.find('.has-no-id').get(0);
		rb.$('#qunit-fixture').append(ext2elem.get(0));

		ext2Instance = ext2elem.rbWidget(modules.ext2.name);


		tmpId = ext2Instance.getId(hasIdElem);
		assert.equal(tmpId, id);

		tmpId = ext2Instance.getId(hasNoIdElem);
		assert.equal(tmpId, hasNoIdElem.id);

		tmpId = ext2Instance.getId();
		assert.equal(tmpId, ext2Instance.element.id);

		assert.ok(hasNoIdElem.id);
		assert.ok(ext2Instance.element.id);

	});

	QUnit.test("rb.Widget - setWidgetFocus / restoreFocus / setFocus", function( assert ){
		var ext2Instance;

		var done = assert.async();
		var content = '<div class="manual-focus" tabindex="-1" style="height: 50px;"></div><div class="js-autofocus" tabindex="-1" style="height: 50px;"></div>';
		var ext2elem = rb.$(document.createElement('div')).html(content).attr({'tabindex': 0});
		var curActive = document.createElement('input');
		var outsideActice = document.createElement('input');

		rb.$('#qunit-fixture').append(curActive);
		rb.$('#qunit-fixture').append(outsideActice);
		rb.$('#qunit-fixture').append(ext2elem.get(0));

		ext2Instance = ext2elem.rbWidget(modules.ext2.name);

		curActive.focus();


		QUnit.afterAF()
			.then(function(){
				ext2Instance.setWidgetFocus();

				return QUnit.afterAF(20).then(function(){
					assert.equal(document.activeElement, ext2elem.find('.js-autofocus').get(0));
				});
			})
			.then(function(){
				ext2Instance.restoreFocus();
				return QUnit.afterAF(20).then(function(){
					assert.equal(document.activeElement, curActive);
				});
			})
			.then(function(){
				ext2Instance.setWidgetFocus('find(.manual-focus)');
				return QUnit.afterAF(20).then(function(){
					assert.equal(document.activeElement, ext2elem.find('.manual-focus').get(0));
				});
			})
			.then(function(){
				ext2Instance.restoreFocus(true);
				return QUnit.afterAF(20).then(function(){
					assert.equal(document.activeElement, curActive);
				});
			})
			.then(function(){
				ext2elem.html('');
				ext2Instance.setWidgetFocus();
				return QUnit.afterAF(20).then(function(){
					assert.equal(document.activeElement, curActive);
				});
			})

			.then(function(){
				ext2elem.html('');
				ext2Instance.setWidgetFocus(true);
				return QUnit.afterAF(20).then(function(){
					assert.equal(document.activeElement, ext2elem.get(0));
				});
			})
			.then(function(){
				outsideActice.focus();
				return QUnit.afterAF(20)
					.then(function(){
						ext2Instance.restoreFocus(true);
						return QUnit.afterAF(20);
					})
					.then(function(){
						assert.equal(document.activeElement, outsideActice);
					})
				;
			})
			.then(function(){
				done();
			})
		;
	});

	QUnit.test("rb.Widget - _trigger", function( assert ){
		var ext2Instance;
		var events = {};
		var ext2elem = rb.$(document.createElement('div'));
		var name = modules.ext2.name;

		ext2elem.on(name +'changed', function(e){
			if(!events[e.type]){
				events[e.type] = {
					count: 0,
				};
			}
			events[e.type].last = e;
			events[e.type].count++;
		});

		ext2elem.on(name +'custom', function(e){
			if(!events[e.type]){
				events[e.type] = {
					count: 0,
				};
			}
			events[e.type].last = e;
			events[e.type].count++;
		});

		rb.$('#qunit-fixture').append(ext2elem.get(0));

		ext2Instance = ext2elem.rbWidget(modules.ext2.name);

		assert.equal(ext2Instance._trigger().type, name +'changed');

		assert.equal(events[name +'changed'].count, 1);

		ext2Instance._trigger({fo: 'bar'});
		assert.equal(events[name +'changed'].count, 2);
		assert.deepEqual(events[name +'changed'].last.detail, {fo: 'bar'});

		ext2Instance._trigger({type: 'custom'});
		assert.equal(events[name +'changed'].count, 2);
		assert.equal(events[name +'custom'].count, 1);


		ext2Instance._trigger('custom', {foo: 'bar2'});
		assert.equal(events[name +'changed'].count, 2);
		assert.equal(events[name +'custom'].count, 2);
		assert.deepEqual(events[name +'custom'].last.detail, {foo: 'bar2'});

		ext2elem.rbWidget()._trigger('changed');
		assert.equal(events[name +'changed'].count, 3);
	});
})();
