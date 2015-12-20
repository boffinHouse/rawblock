(function(){
	'use strict';
	QUnit.module('panel');

	var events = {
		prevent: false,
		changedIndex: 0,
		changeIndex: 0,
		panelchange: function(e){
			if(events.prevent){
				e.preventDefault();
			}
			events.changeIndex++;
		},
		panelchanged: function(){
			events.changedIndex++;
		}
	};

	QUnit.testStart(function(obj){
		if(obj.module != 'panel'){return;}
		rb.$('#qunit-fixture').html('<button type="button" aria-controls="panel-id-id-1" class="rb-button js-click" data-module="panelbutton">Toggle</button>' +
			'<div id="panel-id-id-1" class="rb-panel js-panel" data-module="panel">' +
			'<input class="js-autofocus" />' +
			'<button type="button" class="panel-close">sdsd</button>' +
			'</div>')
		;

		Object.keys(events).forEach(function(evt){
			var type = typeof events[evt];
			if(type == 'function'){
				rb.$(document).on(evt, events[evt]);
			} else if(type == 'number'){
				events[evt] = 0;
			} else if(type == 'boolean'){
				events[evt] = false;
			}

		});
	});

	QUnit.testDone(function(obj){
		if(obj.module != 'panel'){return;}

		Object.keys(events).forEach(function(evt){
			if(typeof events[evt] == 'function'){
				rb.$(document).off(evt, events[evt]);
			}
		});
	});

	QUnit.test('panel and panelbutton', function(assert) {
		var done = assert.async();
		var button = rb.$('#qunit-fixture button[data-module="panelbutton"]').get(0);
		var panel = rb.$('#panel-id-id-1').addClass('is-open').get(0);

		rb.$(panel).rbComponent();
		rb.$(button).rbComponent();

		QUnit.afterAF()
			.then(function() {
				assert.equal(button.getAttribute('aria-expanded'), 'true');
				assert.ok(panel.classList.contains('is-open'));
				assert.strictEqual(rb.$(panel).rbComponent().isOpen, true);
			})
			.then(done)
		;
	});

	QUnit.test('panel and panelbutton', function(assert){
		var done = assert.async();
		var button = rb.$('#qunit-fixture button[data-module="panelbutton"]').get(0);
		var panel = rb.$('#panel-id-id-1').get(0);

		assert.notEqual(button.getAttribute('aria-expanded'), 'true');
		assert.notOk(panel.classList.contains('is-open'));

		rbTest.simulate(button, 'click');

		assert.equal(events.changeIndex, 1);

		QUnit.afterAF()
			.then(function(){
				assert.equal(button.getAttribute('aria-expanded'), 'true');
				assert.ok(panel.classList.contains('is-open'));
				assert.strictEqual(rb.$(panel).rbComponent().isOpen, true);
				assert.equal(events.changedIndex, 1);
				assert.equal(events.changeIndex, 1);
				return QUnit.afterAF(50);
			})
			.then(function(){
				assert.equal(document.activeElement, panel.querySelector('.js-autofocus'));
			})
			.then(function(){
				rbTest.simulate(button, 'click');

				return QUnit.afterAF()
					.then(function(){
						assert.equal(button.getAttribute('aria-expanded'), 'false');
						assert.notOk(panel.classList.contains('is-open'));
						assert.strictEqual(rb.$(panel).rbComponent().isOpen, false);
						assert.equal(events.changedIndex, 2);
						assert.equal(events.changeIndex, 2);
					})
				;
			})
			.then(function(){
				events.prevent = true;
				rbTest.simulate(button, 'click');

				return QUnit.afterAF()
					.then(function(){
						assert.equal(button.getAttribute('aria-expanded'), 'false');
						assert.notOk(panel.classList.contains('is-open'));
						assert.strictEqual(rb.$(panel).rbComponent().isOpen, false);
						assert.equal(events.changedIndex, 2);
						assert.equal(events.changeIndex, 3);
					})
				;
			})
			.then(function(){
				events.prevent = true;
				rb.$(panel).rbComponent().open();

				return QUnit.afterAF()
					.then(function(){
						assert.equal(button.getAttribute('aria-expanded'), 'false');
						assert.notOk(panel.classList.contains('is-open'));
						assert.strictEqual(rb.$(panel).rbComponent().isOpen, false);
						assert.equal(events.changedIndex, 2);
						assert.equal(events.changeIndex, 4);
					})
					;
			})
			.then(function(){
				events.prevent = false;
				rb.$(panel).rbComponent().open();

				return QUnit.afterAF()
					.then(function(){
						assert.equal(button.getAttribute('aria-expanded'), 'true');
						assert.ok(panel.classList.contains('is-open'));
						assert.strictEqual(rb.$(panel).rbComponent().isOpen, true);
						assert.equal(events.changedIndex, 3);
						assert.equal(events.changeIndex, 5);
					})
					;
			})
			.then(function(){
				events.prevent = false;
				rb.$(panel).rbComponent().close();

				return QUnit.afterAF()
					.then(function(){
						assert.strictEqual(rb.$(panel).rbComponent().isOpen, false);
					})
					;
			})
			.then(function(){
				rb.$(panel).rbComponent().setOption('closeOnOutsideClick', true);
				rbTest.simulate(button, 'click');
				return QUnit.afterAF()
					.then(function(){
						assert.strictEqual(rb.$(panel).rbComponent().isOpen, true);
						assert.equal(events.changedIndex, 5);
						assert.equal(events.changeIndex, 7);
					})
					;
			})
			.then(function(){
				rb.$(panel).rbComponent().setOption('closeOnOutsideClick', true);
				rbTest.simulate(button, 'click');
				return QUnit.afterAF()
					.then(function(){
						assert.strictEqual(rb.$(panel).rbComponent().isOpen, false);
						assert.equal(events.changedIndex, 6);
						assert.equal(events.changeIndex, 8);
					})
					;
			})
			.then(function(){
				rb.$(panel).rbComponent().open();

				return QUnit.afterAF()
					.then(function(){
						assert.strictEqual(rb.$(panel).rbComponent().isOpen, true);
					})
				;
			})
			.then(function(){
				rb.$(panel).rbComponent().open();
				rbTest.simulate(document.querySelector('#qunit-fixture'), 'click');
				return QUnit.afterAF(99)
					.then(function(){
						assert.strictEqual(rb.$(panel).rbComponent().isOpen, false);
					})
					;
			})
			.then(function(){
				rb.$(panel).rbComponent().open();

				return QUnit.afterAF(99)
					.then(function(){
						assert.strictEqual(rb.$(panel).rbComponent().isOpen, true);
					})
					;
			})
			.then(function(){
				rbTest.simulate(panel.querySelector('.panel-close'), 'click');
				return QUnit.afterAF(99)
					.then(function(){
						assert.strictEqual(rb.$(panel).rbComponent().isOpen, false);
					})
					;
			})
			.then(done)
		;
	});
})();
