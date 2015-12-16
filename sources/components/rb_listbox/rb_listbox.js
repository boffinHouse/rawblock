(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    var rb = window.rb;
    var $ = rb.$;

    var Listbox = rb.Component.extend('listbox',
        /** @lends rb.components.listbox.prototype */
        {
            /**
             * @static
             * @mixes rb.Component.defaults
             * @property {Object} defaults
             */
            defaults: {
                focusElement: '',
            },
            statics: {
                regList: /^(?:ol|ul)$/i,
                type: {
                    select: {
                        index: 'selectedIndex',
                        item: 'selectedItem',
                        change: '_changeSelected',
                    },
                    check: {
                        index: 'checkedIndex',
                        item: 'checkedItem',
                        change: '_changeChecked',
                    },
                }
            },
            /**
             * @constructs
             */
            init: function (element) {
                this._super(element);

                this.selectedIndex = -1;
                this.selectedItem = -1;

                this.checkedIndex = -1;
                this.checkedItem = -1;

                this.isList = Listbox.regList.test(element.nodeName);

                rb.rAFs(this, {throttle: true}, '_changeSelected', '_changeChecked', 'postRender', 'renderList', '_setFocusElement');

                this._onkeyboardInput = this._onkeyboardInput.bind(this);
                this._onBlur = this._onBlur.bind(this);

                this._getElements();
                this._setFocusElement();
            },
            setOption: function (name, value) {

                this._super(name, value);

                switch (name) {
                    case 'focusElement':
                        this._setFocusElement();
                        break;
                }
            },
            events: {
                'mousedown .{name}-item': function (e) {
                    this.select(e.delegatedTarget);
                },
                'click .{name}-item': function (e) {
                    this.select(e.delegatedTarget);
                    this.check(e.delegatedTarget);
                }
            },
            _getElements: function () {
                this.$items = $(this.queryAll('.{name}-item'));
                this.checkedItems = this.$items.filter('.is-checked').get(0) || null;
                this.checkedIndex = (this.checkedItems) ? this.$items.index(this.checkedItems) : -1;
            },
            _onkeyboardInput: function (e) {
                var prevent;
                if (e.keyCode == 40) {
                    prevent = true;
                    this.selectNext();
                } else if (e.keyCode == 38) {
                    prevent = true;
                    this.selectPrev();
                } else if (e.keyCode == 32 || e.keyCode == 13) {
                    prevent = true;
                    this.checkSelected();
                }

                if (prevent) {
                    e.preventDefault();
                }
            },
            _onBlur: function () {
                this.select(-1);
            },
            _setFocusElement: function () {
                var value = this.options.focusElement;

                if (this.focusElement) {
                    this.focusElement.removeAttribute('aria-activedescendant');
                    this.focusElement.removeEventListener('keydown', this._onkeyboardInput);
                    this.focusElement.removeEventListener('blur', this._onBlur);
                }

                this.focusElement = typeof value == 'object' ?
                    value :
                    (value && this.getElementsFromString(value)[0] || this.element)
                ;

                this.focusElement.addEventListener('keydown', this._onkeyboardInput);
                this.focusElement.addEventListener('blur', this._onBlur);
            },
            _selectCheck: function (index, type) {
                var item;
                type = Listbox.type[type];
                if (index == -1 || index == null) {
                    index = -1;
                    item = null;
                } else if (typeof index == 'number') {
                    item = this.$items.get(index);
                } else {
                    item = index;
                    index = this.$items.index(item);
                }

                if (index != this[type.index]) {
                    this[type.index] = index;
                    this[type.item] = item;
                    this[type.change]();
                }
            },
            select: function (index) {
                this._selectCheck(index, 'select');
            },
            _changeSelected: function () {
                this.$items.removeClass('is-selected');

                if (this.selectedItem) {
                    this.selectedItem.classList.add('is-selected');
                    this.focusElement.setAttribute('aria-activedescendant', this.getId(this.selectedItem));
                }
                this._trigger('selectedchanged');
            },

            selectNext: function () {
                var index = this.selectedIndex + 1;

                if (index > -1 && this.$items.length > index) {
                    this.select(index);
                }
            },
            selectPrev: function () {
                var index = this.selectedIndex - 1;

                if (index > -1 && this.$items.length > index) {
                    this.select(index);
                }
            },
            _changeChecked: function () {
                this.$items.removeClass('is-checked');

                if (this.checkedItem) {
                    this.checkedItem.classList.add('is-checked');
                }
                this._trigger();
            },
            check: function (index) {
                this._selectCheck(index, 'check');
            },
            checkSelected: function () {
                if (this.selectedItem) {
                    this.check(this.selectedItem);
                }
            },
            postRender: function () {
                //this.
            },
            renderList: function () {

            },
        }
    );

    return Listbox;
}));
