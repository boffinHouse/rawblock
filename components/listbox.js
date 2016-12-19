const rb = window.rb;

/**
 * Class component to create a ListBox.
 *
 * @name rb.components.listbox
 *
 * @extends rb.Component
 *
 * @param element {Element}
 * @param [initialDefaults] {OptionsObject}
 *
 * @fires componentName#changed
 *
 * @example
 * <div class="js-rb-live" data-module="listbox">
 *      <span class="listbox-item">Item 1</span>
 *      <span class="listbox-item">Item 2</span>
 * </div>
 */
class Listbox extends rb.Component {

    /**
     * @static
     * @mixes rb.Component.defaults
     * @property {Object} defaults
     */
    static get defaults(){
        return {
            focusElement: '',
            defaultSelected: 0,
            checkWithSpace: false,
            disconnected: false,
        };
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.selectedIndex = -1;
        this.selectedItem = null;

        this.checkedIndex = -1;
        this.checkedItem = null;

        this.isList = Listbox.regList.test(element.nodeName);

        rb.rAFs(this, {throttle: true}, '_changeSelected', '_changeChecked', 'postRender', 'renderList', '_setFocusElement', '_setInitialMarkup');

        this._onkeyboardInput = this._onkeyboardInput.bind(this);

        this.setFocusElement();
        this._getElements();
    }

    static get events(){
        return {
            'mousedown:closest(.{name}{e}item)' (e) {
                this.select(e.delegatedTarget);
            },
            'click .{name}{e}item:not([aria-disabled="true"])' (e) {
                this.select(e.delegatedTarget);
                this.check(e.delegatedTarget);
            },
        };
    }

    setOption (name, value, isSticky) {

        super.setOption(name, value, isSticky);

        switch (name) {
            case 'focusElement':
                this.setFocusElement();
                break;
            case 'disconnected':
                this[value ? '_disconnect' : '_connect']();
                break;
        }
    }

    _setInitialMarkup(){
        this.$items
            .attr({role: 'option'})
            .parent()
            .attr({role: 'listbox'})
        ;

        this.$items
            .filter( '.' + rb.statePrefix + 'disabled')
            .attr({'aria-disabled': 'true'})
        ;

        if(this.checkedItem){
            this.checkedItem.setAttribute('aria-checked', 'true');
        }

        if(this._isStatic){
            this.element.style.position = 'relative';
        }
    }

    _getElements() {
        this.$items = this.$queryAll('.{name}{e}item');
        this.checkedItem = this.$items.filter('.' + rb.statePrefix + 'checked').get(0) || null;
        this.checkedIndex = (this.checkedItem) ? this.$items.index(this.checkedItem) : -1;
        this._isStatic = this.$element.css('position') == 'static';
        this._setInitialMarkup();

        if(!this.options.disconnected){
            this._connect();
        }
    }

    _onkeyboardInput(e) {
        var prevent;

        if(this.options.disconnected){return;}

        if (e.keyCode == 40) {
            prevent = true;
            this.selectNext();
            this.scrollIntoView(this.selectedItem);
        } else if (e.keyCode == 38) {
            prevent = true;
            this.selectPrev();
            this.scrollIntoView(this.selectedItem);
        } else if (this.selectedItem && (e.keyCode == 13 || (e.keyCode == 32 && this.options.checkWithSpace))) {
            prevent = true;
            this.checkSelected();
        }

        if (prevent) {
            e.preventDefault();
        }
    }

    _disconnect () {
        this.select(-1);
    }

    _connect(){
        var activeItem = this.focusElement.getAttribute('aria-activedescendant');
        if(activeItem){
            activeItem = this.query('#'+ activeItem);
        }
        this.select(this.checkedItem || activeItem || this.options.defaultSelected);
        this.scrollIntoView(this.checkedItem || activeItem, true);
    }

    setFocusElement(){
        var value = this.options.focusElement;
        var old = this.focusElement;

        this.focusElement = typeof value == 'object' ?
            value :
            (value && this.getElementsFromString(value)[0] || this.element)
        ;

        if(old && old != this.focusElement){
            old.removeEventListener('keydown', this._onkeyboardInput);
        } else {
            old = null;
        }

        this.focusElement.addEventListener('keydown', this._onkeyboardInput);

        this._setFocusElement(old);
    }

    _setFocusElement(old) {
        if (old) {
            old.removeAttribute('aria-activedescendant');
            old.removeAttribute('tabindex');
        }

        if(this.focusElement.tabIndex == -1 && !this.focusElement.getAttribute('tabindex')){
            this.focusElement.setAttribute('tabindex', '0');
        }
    }

    _selectCheck (index, type) {
        var item;
        var typeData = Listbox.type[type];

        if (index == -1 || index == null) {
            index = -1;
            item = null;
        } else if (typeof index == 'number') {
            item = this.$items.get(index);
        } else {
            item = index;
            index = this.$items.index(item);
        }

        if (index != this[typeData.index]) {
            this[typeData.index] = index;
            this[typeData.item] = item;
            this[typeData.change]();
        }
    }

    scrollIntoView(item, noAnimate){
        if(!item || this.element.scrollHeight - 1 <= this.element.offsetHeight){
            return;
        }
        var moveScroll;
        var listboxTop = this.element.scrollTop;
        var listboxBottom = this.element.offsetHeight + listboxTop;
        var itemTop = item.offsetTop;
        var itemBottom = itemTop + item.offsetHeight;
        var isStartReached = itemTop < listboxTop;
        var isEndReached = itemBottom > listboxBottom;

        if(isStartReached || isEndReached){
            moveScroll = itemTop;

            this.$element[noAnimate ? 'prop' : 'animate'](
                {
                    scrollTop: moveScroll,
                },
                {
                    duration: 200,
                }
            );
        }
    }

    select (index) {
        this._selectCheck(index, 'select');
    }

    _changeSelected () {
        this.$items.removeClass(rb.statePrefix + 'selected');

        if (this.selectedItem) {
            this.selectedItem.classList.add(rb.statePrefix + 'selected');
            this.focusElement.setAttribute('aria-activedescendant', this.getId(this.selectedItem));
        }
        this.trigger('selectedchanged');
    }

    getSelectableIndex(dir){
        var item;
        var ret = -1;
        var disabledClass = rb.statePrefix + 'disabled';
        var index = this.selectedIndex + dir;

        while(index > -1 && this.$items.length > index){
            item = this.$items.get(index);
            if(!item.classList.contains(disabledClass) && item.getAttribute('aria-disabled') != 'true'){
                ret = index;
                break;
            }
            index += dir;
        }

        return ret;
    }

    selectNext () {
        var index = this.getSelectableIndex(1);

        if (index > -1) {
            this.select(index);
        }
    }

    selectPrev () {
        var index = this.getSelectableIndex(-1);

        if (index > -1) {
            this.select(index);
        }
    }

    _changeChecked() {
        this.$items
            .filter('.' + rb.statePrefix + 'checked')
            .rbToggleState('checked', false)
            .removeAttr('aria-checked')
        ;

        if (this.checkedItem) {
            this.checkedItem.classList.add(rb.statePrefix + 'checked');
            this.checkedItem.setAttribute('aria-checked', 'true');

        }
        this.trigger();
    }

    check (index) {
        this._selectCheck(index, 'check');
    }

    checkSelected() {
        if (this.selectedItem) {
            this.check(this.selectedItem);
        }
    }

    postRender() {}

    renderList() {

    }
}

Object.assign(Listbox, {
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
    },
});

rb.live.register('listbox', Listbox);

export default Listbox;
