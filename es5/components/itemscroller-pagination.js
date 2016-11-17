(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './itemscroller'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./itemscroller'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.itemscroller);
        global.itemscrollerPagination = mod.exports;
    }
})(this, function (module) {
    'use strict';

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    (function (factory) {
        if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
            module.exports = factory();
        } else {
            factory();
        }
    })(function () {
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
                paginationFor: ''
            },
            init: function init(element, initialDefaults) {
                this._super(element, initialDefaults);

                this.updateScrollerAsPagination = rb.rAF(this.updateScrollerAsPagination, { that: this });

                if (this.options.paginationFor) {
                    this.setOption('paginationFor', this.options.paginationFor);
                }
            },
            events: {
                'click:closest(.{name}{e}cell)': function clickClosestNameECell(e) {
                    if (!this.groupedMainComponent) {
                        return;
                    }
                    this.groupedMainComponent.selectedIndex = this.$cells.index(e.delegatedTarget || e.currentTarget);
                }
            },
            setOption: function setOption(name, value) {
                this._super(name, value);

                if (name == 'paginationFor') {
                    if (value) {
                        this._setupScrollerAsPagination();
                    } else {
                        this._teardownScrollerAsPagination();
                    }
                }
            },
            updateScrollerAsPagination: function updateScrollerAsPagination() {
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
            _setupScrollerAsPagination: function _setupScrollerAsPagination() {
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
            _teardownScrollerAsPagination: function _teardownScrollerAsPagination() {
                if (this.groupedMainComponent && this.groupedMainElement) {
                    $(this.groupedMainElement).off(this.groupedMainComponent._evtName, this.updateScrollerAsPagination);
                    this.groupedMainComponent = null;
                    this.groupedMainElement = null;
                }
            }
        });

        return ItemScroller;
    });
});
