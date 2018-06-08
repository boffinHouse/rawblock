import rb, { Component } from '../core';
import './itemscroller';

const $ = Component.$;

class ItemScrollerPagination extends rb.components.itemscroller {
    /**
     * @static
     * @mixes rb.components.itemscroller.defaults
     *
     * @property {String} paginationFor='' Reference to another scroller that should be paginated with this scroller instance. The value is processed by rb.elementFromStr.
     */
    static get defaults(){
        return {
            paginationFor: '',
        };
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.updateScrollerAsPagination = rb.rAF(this.updateScrollerAsPagination, {that: this});

        if (this.options.paginationFor) {
            this.setOption('paginationFor', this.options.paginationFor);
        }
    }

    static get events(){
        return {
            'click:closest(.{name}{e}cell)'(e) {
                if (!this.groupedMainComponent) {
                    return;
                }
                this.groupedMainComponent.selectedIndex = this.$cells.index(e.delegatedTarget || e.currentTarget);
            },
        };
    }

    setOption(name, value, isSticky) {
        super.setOption(name, value, isSticky);

        if (name == 'paginationFor') {
            if (value) {
                this._setupScrollerAsPagination();
            } else {
                this._teardownScrollerAsPagination();
            }
        }
    }

    updateScrollerAsPagination() {
        var cell;
        var selectedIndex = this.groupedMainComponent.selectedIndex;

        if (!this.$cells || !this.$cells.length) {
            return;
        }

        this.$cells.rbToggleState('selected{-}pagination', false);

        cell = this.$cells.eq(selectedIndex).rbToggleState('selected{-}pagination', true).get(0);

        if (this.isCellVisible(cell) !== true) {
            this.selectCell(selectedIndex);
        }
    }

    _setupScrollerAsPagination() {
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
    }

    _teardownScrollerAsPagination() {
        if (this.groupedMainComponent && this.groupedMainElement) {
            $(this.groupedMainElement).off(this.groupedMainComponent._evtName, this.updateScrollerAsPagination);
            this.groupedMainComponent = null;
            this.groupedMainElement = null;
        }
    }
}

Component.register('itemscroller', ItemScrollerPagination, true);

export default ItemScrollerPagination;

