import '../utils/rb_resize';

const regPoint = /^./;
const rb = window.rb;
const $ = rb.$;

/**
 * Class component to create a ShrinkNav.
 *
 * @alias rb.components.shrinknav
 *
 * @extends rb.Component
 *
 * @param element {Element}
 * @param [initialDefaults] {OptionsObject}
 *
 * @fires shrinknav#changed
 *
 * @example
 * <div class="js-rb-live" data-module="shrinknav"></div>
 */
class ShrinkNav extends rb.Component {
    /**
     * @static
     * @mixes rb.Component.defaults
     *
     * @prop {String} measureElement='self' The element that is used to measure the full width. Either self or a selector.
     * @prop {String} items='.children(.{name}{e}item)' The items which may be overflowed.
     * @prop {String} toggleItemSelector='.{name}{e}toggle{-}item' The items which may be overflowed.
     * @prop {Number} minItems=2 The minimum items to see in the main bar.
     * @prop {Number} minSubItems=2 The minimum items to see in the submenu.
     * @prop {Boolean} growItems=false
     */
    static get defaults() {
        return {
            measureElement: 'self',
            items: '.children(.{name}{e}item)',
            toggleItemSelector: '.is{-}toggle{-}item',
            togglePanel: 'find(.{name}{e}panel)',
            minItems: 2,
            minSubItems: 2,
            growItems: false,
        };
    }

    static get events(){
        return {
            'rb_resize': 'measureElements',
        };
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.rAFs('addItemsTo');

        this.reflow = rb.throttle(this.measureElements);

        this._getMeasureElement();
        this._getItems();
        this._calcMinItems();

        this.log(this);

        this.measureElements();
    }

    setOption(name, value, isSticky){
        super.setOption(name, value, isSticky);

        if(name == 'measureElement'){
            this._getMeasureElement();
            this.reflow();
        } else if(name == 'minSubItems' || name == 'minItems'){
            this._calcMinItems();
            this.reflow();
        }
    }

    _switchOff(){

    }

    _switchOn(){

    }

    _calcMinItems(){
        const fullLength = this.allItems.length;
        const {minSubItems, minItems} = this.options;
        const needItems = minSubItems + minItems;

        if(needItems > fullLength){
            if(minItems < fullLength){
                this.minSubItems = fullLength - minItems;
            } else {
                this.minItems = 0;
                this.minSubItems = 0;
            }
        } else {
            this.minItems = minItems;
            this.minSubItems = minSubItems ;
        }

        if(this.minItems < 2){
            this.minItems = 0;
        }

        if(this.minSubItems < 2){
            this.minSubItems = 0;
        }
    }

    hideItems(){
        const hideItems = [];

        let currentMenuLength = this.menuItems.length;
        let currentVisibleLength = this.visibleItems.length;

        this.visibleItems.forEach((item)=>{
            if(this.remainingWidth < 0 || currentMenuLength < this.minSubItems || currentVisibleLength < this.minItems ){
                hideItems.push(item);

                currentVisibleLength--;
                currentMenuLength++;
            }
            this.remainingWidth += item.width;
        });

        this.addItemsTo(hideItems);
    }

    showElements(){
        let run = true;
        const changeItems = [];
        const lastIndex = this.menuItems.length - 1;
        let currentMenuLength = this.menuItems.length;
        let currentVisibleLength = this.visibleItems.length;

        this.menuItems.forEach((item, index) => {
            if(run){
                if(index == lastIndex){
                    this.remainingWidth += this.toggleItemWidth;
                }

                if(this.remainingWidth > item.width){
                    changeItems.push(item);

                    currentVisibleLength++;
                    currentMenuLength--;

                    this.remainingWidth -= item.width;
                } else {
                    run = false;
                }
            }
        });

        if(currentMenuLength){
            while(changeItems.length && currentMenuLength < this.minSubItems){
                changeItems.pop();

                currentVisibleLength--;
                currentMenuLength++;
            }

            if(currentVisibleLength < this.minItems){
                return;
            }
        }

        if(changeItems.length){
            this.addItemsTo(changeItems, true);
        }
    }

    addItemsTo(items, isVisibleBar){
        const hadSubmenu = !!this.menuItems.length;

        if(isVisibleBar){
            items.forEach(this.addItemToBar, this);
        } else {
            items.forEach(this.addItemToPanel, this);
        }

        const hasMenus = !!this.menuItems.length;

        if(this.hasSubmenu !== hasMenus){
            this.hasSubmenu = hasMenus;
            this.$element.rbToggleState('submenu-within', hasMenus);
        }

        this.trigger({hadSubmenu, changedItems: items, setToBar: !!isVisibleBar});
    }

    addItemToBar(item){
        const index = this.menuItems.indexOf(item);
        const posItem = this.allItems[item.position - 1];

        if(posItem){
            posItem.$item.after(item.$item);
        } else {
            $(item.parent).prepend(item.$item);
        }

        if(index != -1){
            this.menuItems.splice(index, 1);
            this.visibleItems.unshift(item);
        }
    }

    addItemToPanel(item){
        const index = this.visibleItems.indexOf(item);

        this.$submenu.prepend(item.$item);

        if(index != -1){
            this.visibleItems.splice(index, 1);
            this.menuItems.unshift(item);
        }
    }

    measureElements(){
        const add = this.options.growItems ? -0.1 : 0.1;
        const {menuItems} = this;

        this.innerWidth = this.$measureElement.innerWidth();

        this.neededWidth = this.visibleItems.reduce((value, item) => {
            item.width = item.$item.outerWidth() + add;
            return value + item.width;
        }, 0);

        this.toggleItemWidth = this.$toggleItem.outerWidth() || this.toggleItemWidth || 0;
        this.remainingWidth = this.innerWidth - this.neededWidth - this.toggleItemWidth;

        if(this.remainingWidth < (menuItems.length ? 0 : -this.toggleItemWidth) + 0.1){
            this.hideItems();
        } else if(this.menuItems.length) {
            const itemWidth = menuItems.length == 1 ?
                menuItems[0].width - this.toggleItemWidth :
                menuItems[0].width
            ;

            if(this.remainingWidth > itemWidth + 0.1){
                this.showElements();
            }
        }
    }

    _getItems(){
        const {items, toggleItemSelector, togglePanel} = this.options;

        const toggleItem = this.query(toggleItemSelector);

        this.$submenu = $(this.getElementsByString(togglePanel)[0]);

        this.$toggleItem = $(toggleItem);

        this.allItems = this.getElementsByString(items)
            .filter(item => item != toggleItem)
            .map((item, position)=> ({
                $item: $(item),
                width: 0,
                position,
                parent: item.parentNode,
                priority: (parseInt(item.getAttribute('data-priority'), 10) || 0),
            }))
        ;

        if(!this.$submenu.is('ul, ol') && (this.allItems[0] && this.allItems[0].$item.is('li'))){
            const $menuWrapper = this.$submenu;
            this.$submenu = $(document.createElement('ul'));

            this.$submenu.prop({className: this.interpolateName(`${togglePanel.replace(regPoint, '')}{-}list`)});

            rb.rAFQueue(()=>{
                $menuWrapper.append(this.$submenu);
            });
        }

        this.visibleItems = [...this.allItems];

        this.visibleItems
            .sort(
                (item1, item2) =>
                    (item2.priority - item1.priority)
            )
        ;

        this.visibleItems.reverse();
        this.menuItems = [];

    }

    _getMeasureElement(){
        const {measureElement} = this.options;

        this.$measureElement = measureElement == 'self' ?
            this.$element :
            this.$element.closest(measureElement)
        ;
    }
}

rb.live.register('shrinknav', ShrinkNav);

export default ShrinkNav;
