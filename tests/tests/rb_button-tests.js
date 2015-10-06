(function(){
	'use strict';
	QUnit.module('rb_button');

	var module = {};
	QUnit.testStart(function(obj){
		if(obj.module != 'rb_button'){return;}
		var fn;
		var id = rb.getID();
		var name = 'panel' + id;

		var addSpy = function(){
			for(fn in module.widget.prototype){
				if(typeof module.widget.prototype[fn] == 'function' && !('getCall' in module.widget.prototype[fn])){
					sinon.spy(module.widget.prototype, fn);
				}
			}
		};

		module = {
			name: name,
			widget: rb.Widget.extend(name, {

				init: function(element){
					this._super(element);
				},
				toggle: function(){
					if(this.element.classList.contains('panel-open')){
						this.close();
					} else {
						this.open();
					}

				},
				open: function(){
					this.element.classList.add('panel-open');
				},
				close: function(){
					this.element.classList.remove('panel-open');
				},
				special: function(){
					this.element.classList.add('special-panel');
				}
			})
		};

		addSpy();
	});

	QUnit.test("rb.$", function( assert ){
		var $button, $panel1, $panel2;
		var done = assert.async();
		var content = '<button id="test-button" data-module="button" data-target="next()" class="js-click"></button><div id="test-panel1" data-module="'+ module.name +'"></div><div id="test-panel2" data-module="'+ module.name +'"></div>'

		rb.$('#qunit-fixture').html(content);

		$button = rb.$('#test-button');
		$panel1 = rb.$('#test-panel1');
		$panel2 = rb.$('#test-panel2');

		$button.get(0).click();

		assert.ok($panel1.get(0).classList.contains('panel-open'));

		assert.equal($panel1.rbWidget().activeButtonWidget, $button.rbWidget());
		assert.equal($button.rbWidget().target, $panel1.get(0));

		assert.notOk($panel2.get(0).classList.contains('panel-open'));

		$button.attr({'data-target': 'test-panel2'});
		$button.get(0).click();

		assert.ok($panel1.get(0).classList.contains('panel-open'));
		assert.ok($panel2.get(0).classList.contains('panel-open'));
		assert.equal($panel2.rbWidget().activeButtonWidget, $button.rbWidget());
		assert.equal($button.rbWidget().target, $panel2.get(0));

		$button.rbWidget().setTarget($panel1.get(0));
		$button.rbWidget().setOption('type', 'special');
		$button.get(0).click();

		assert.equal($button.rbWidget().target, $panel1.get(0));
		assert.ok($panel1.get(0).classList.contains('special-panel'));

		QUnit.afterAF()
			.then(function(){
				assert.equal($button.attr('aria-controls'), $panel1.prop('id'));
			})
			.then(done)
		;
	});
})();
