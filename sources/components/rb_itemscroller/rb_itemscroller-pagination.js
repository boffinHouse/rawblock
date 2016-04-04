(function (factory) {
    if (typeof module === 'object' && module.exports) {
        require('./rb_itemscroller');
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    var rb = window.rb;
    var $ = rb.$;

    var ItemScroller = rb.Component.mixin(rb.components.itemscroller,
        /** @lends rb.components.itemscroller.prototype */
        {
            /**
             * @static
             * @mixes rb.components.itemscroller.prototype.defaults
             * @property {String} paginationFor='' Reference to another scroller that should be paginated with this scroller instance. The value is processed by rb.elementFromStr.
             */
            defaults: {
                paginationFor: '',
            },
            init: function (element, initialDefaults) {
                this._super(element, initialDefaults);

                this.updateScrollerAsPagination = rb.rAF(this.updateScrollerAsPagination, {that: this});

                if (this.options.paginationFor) {
                    this.setOption('paginationFor', this.options.paginationFor);
                }
            },
            events: {
                'click:closest(.{name}{e}cell)': function (e) {
                    if (!this.groupedMainComponent) {
                        return;
                    }
                    this.groupedMainComponent.selectedIndex = this.$cells.index(e.delegatedTarget || e.currentTarget);
                }
            },
            setOption: function (name, value) {
                this._super(name, value);

                if (name == 'paginationFor') {
                    if (value) {
                        this._setupScrollerAsPagination();
                    } else {
                        this._teardownScrollerAsPagination();
                    }
                }
            },
            updateScrollerAsPagination: function () {
                var cell;
                var selectedIndex = this.groupedMainComponent.selectedIndex;

                if (!this.$cells || !this.$cells.length) {
                    return;
                }

                this.$cells.rbChangeState('selected{-}pagination');

                cell = this.$cells.eq(selectedIndex).rbChangeState('selected{-}pagination', true).get(0);

                if (this.isCellVisible(cell) !== true) {
                    this.selectCell(selectedIndex);
                }
            },
            _setupScrollerAsPagination: function () {
                this._teardownScrollerAsPagination();
                var paginationFor = this.options.paginationFor;
                if (!paginationFor) {
                    return;
                }

                this.groupedMainElement = rb.elementFromStr(paginationFor, this.element)[0] || null;

                if (!this.groupedMainElement) {
                    return;
                }

                this.groupedMainComponent = this.component(this.groupedMainElement);

                if (!this.groupedMainComponent) {
                    return;
                }

                $(this.groupedMainElement).on(this.groupedMainComponent._evtName, this.updateScrollerAsPagination);
                this.updateScrollerAsPagination();
            },
            _teardownScrollerAsPagination: function () {
                if (this.groupedMainComponent && this.groupedMainElement) {
                    $(this.groupedMainElement).off(this.groupedMainComponent._evtName, this.updateScrollerAsPagination);
                    this.groupedMainComponent = null;
                    this.groupedMainElement = null;
                }
            }
        }
    );

    return ItemScroller;
}));
