import rb, { Component } from '../core';
import './itemscroller';

const regSizes = /(\(\s*(min|max)(-width)?\s*:\s*(\d+\.*\d*)(px)?\)\s*)?(\d+\.*\d*)(px|%)?/g;

const createConditions = rb.memoize(function (value) {

    var match, size;

    var sizes = [];

    while((match = regSizes.exec(value))){
        size = {
            condition: parseFloat(match[4]),
            type: match[2],
            str: match[0],
            value: parseFloat(match[6]),
            unit: match[7] || 'px',
        };

        size.css = size.value + size.unit;

        sizes.push(size);
    }

    return sizes;
}, true);

class ItemScrollerQueries extends rb.components.itemscroller {
    /**
     * @static
     * @mixes rb.components.itemscroller.defaults
     * @prop {String} queries="" Container queries configuration represented by a `sizes` like comma separated string. `"(max-width: 480px) cellWidthSize1(%|px), (max-width: 1024px) cellWidthSize2(%|px), defaultCellWidthSize(%|px)"` (i.e.: `"(max-width: 480px) 100%, (max-width: 1024px) 50%, 600px"`).
     * @prop {String} modifyUsePx=true Wether the `usePx` option should automatically changed.
     */
    static get defaults() {
        return {
            queries: '',
            modifyUsePx: true,
        };
    }

    beforeConstruct(){
        super.beforeConstruct();

        this.rAFs({batch: true}, '_setCurrentQuery');
    }

    _parseQueries() {
        const queries = this.options.queries;

        if (!queries) {
            this._parsedQueries = null;
            return;
        }
        if (this._parsedQueries && this._parsedQueries.queryString == queries) {
            return;
        }

        this._parsedQueries = createConditions(queries);
        this._parsedQueries.queryString = queries;
    }

    setOption(name, value, isSticky) {
        super.setOption(name, value, isSticky);

        if (name == 'queries') {
            this.calculateLayout();
        }
    }

    _getCellWidth(element) {
        return this._parsedQueries && this._parsedQueries.currentQuery ?
            this._parsedQueries.currentQuery.computedValue :
            super._getCellWidth(element)
        ;
    }

    _getCurrentQuery() {
        if (!this._parsedQueries) {
            return;
        }
        let currentQuery, i;

        for (i = 0; i < this._parsedQueries.length; i++) {
            currentQuery = this._parsedQueries[i];
            if(!currentQuery.condition ||
                !currentQuery.type ||
                (currentQuery.type == 'max' && this.viewportWidth <= currentQuery.condition) ||
                (currentQuery.type == 'min' && this.viewportWidth >= currentQuery.condition)){
                break;
            }
        }

        currentQuery.computedValue = currentQuery.unit == '%' ?
        this.viewportWidth * currentQuery.value / 100 :
            currentQuery.value
        ;

        if(this.options.modifyUsePx){
            this.options.usePx = currentQuery.unit == 'px';
        }

        if (currentQuery != this._parsedQueries.currentQuery) {
            this._parsedQueries.currentQuery = currentQuery;
            this._setCurrentQuery();
        }
    }

    _setCurrentQuery() {
        if (this._parsedQueries && this._parsedQueries.currentQuery) {
            this.$cells.css({width: this._parsedQueries.currentQuery.css});
        }
    }

    _switchOff() {
        const ret = super._switchOff();

        if (this._parsedQueries && this._parsedQueries.currentQuery) {
            this._parsedQueries.currentQuery = null;
            this.$cells.css({width: ''});
        }
        return ret;
    }

    _calculateCellLayout() {
        this._parseQueries();
        this._getCurrentQuery();

        return super._calculateCellLayout();
    }
}

Component.register('itemscroller', ItemScrollerQueries, true);

export default ItemScrollerQueries;
