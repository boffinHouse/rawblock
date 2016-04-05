(function () {
    'use strict';
    /* jshint eqnull: true */
    var rb = window.rb;
    var $ = rb.$;

    var Datepicker = rb.Component.extend('datepicker',
        /** @lends rb.components.dateinput.prototype */
        {

            /**
             * @static
             * @mixes rb.Component.prototype.defaults
             * @property {Object} defaults
             * //@property {Boolean} defaults.debug=true Log debug messages
             */
            defaults: {
                debug: true,
                value: null,
                multiple: false,
                range: false,
                max: NaN,
                min: NaN,
            },
            /**
             * @constructs
             * @classdesc Class component to create a dateinput.
             * @name rb.components.dateinput
             * @extends rb.Component
             * @fires dateinput#changed
             * @param {Element} element
             * @example
             * <div class="rb-datepicker js-rb-life" data-module="datepicker">
             *
             * </div>
             * @example
             * rb.$('.rb-datepicker').rbComponent();
             */
            init: function (element, initialDefaults) {
                this._super(element, initialDefaults);

                this._values = [];
                this.valueData = {};

                //this.log(this.element, this.$element, this.options, this);

                this.formats = window.rb.i18n.formats.de;

                rb.rAFs(this, {throttle: true}, 'renderWrapper', 'renderMonth');

                this.renderWrapper();
                this.renderMonth(new Date());
            },
            events: {
                'click:closest(.{name}{e}btn{-}prev)': 'previous',
                'click:closest(.{name}{e}btn{-}next)': 'next',
            },
            statics: {
                views: {
                    0: 'Month',
                    1: 'Year',
                    2: 'Decade'
                },
            },
            getPreviousMonth: function (from) {
                return (from.month == 1) ?
                (from.year - 1) + '-12' :
                (from.year) + '-' + (from.month - 1);
            },
            getNextMonth: function (from) {
                return (from.month == 12) ?
                (from.year + 1) + '-01' :
                (from.year) + '-' + (from.month + 1);
            },
            previous: function () {
                this.renderMonth(this.getPreviousMonth(this.selectedDate));
            },
            next: function () {
                this.renderMonth(this.getNextMonth(this.selectedDate));
            },
            get value() {

            },
            set value(value) {

            },
            setOption: function (name, value) {
                this._super(name, value);
            },
            getDate: function (date) {
                var dateArray;

                dateArray = [date.getFullYear(), date.getMonth() + 1, date.getDate()];

                return {
                    dateArray: dateArray,
                    yearNumber: dateArray[0],
                    monthNumber: (dateArray[0] + '' + dateArray[1]) * 1,
                    dateNumber: dateArray.join('') * 1,
                    year: dateArray[0],
                    month: dateArray[1],
                    date: dateArray[2],
                    day: date.getDay(),
                };
            },
            renderWrapper: function () {
                var wrapperHTML = this.render('wrapper', {
                    formats: this.formats,
                });

                this.element.innerHTML = wrapperHTML;

                this.mainElement = this.query('.{name}{e}main');
                this.headerElement = this.query('.{name}{e}btn{-}header');
            },
            renderMonth: function (date) {
                if (!date.getFullYear) {
                    date = new Date(date);
                }

                var selectedDate = this.getDate(date);
                var monthData = {
                    title: this.formats.monthNames[selectedDate.month - 1] + ' ' + selectedDate.year,
                    formats: this.formats,
                    body: this.getMonthData(date, selectedDate),
                    selected: selectedDate,
                };
                var monthHTML = this.render('month', monthData);

                this.selectedDate = selectedDate;

                this.headerElement.innerHTML = monthData.title;
                this.mainElement.innerHTML = monthHTML;

                //console.log(monthHTML, monthData);
            },
            getMonthData: function (date, selectedDate) {
                var tmp, i, days, firstDay, curDate;

                var dayRows = [];

                date.setDate(1);

                firstDay = date.getDay();

                if (firstDay != this.formats.firstDay) {
                    tmp = firstDay - this.formats.firstDay;
                    if (tmp < 0) {
                        tmp += 7;
                    }
                    date.setDate(date.getDate() - tmp);
                }

                for (i = 0; i < 50; i++) {
                    curDate = this.getDate(date);
                    curDate.otherMonth = (curDate.monthNumber != selectedDate.monthNumber);

                    if (!(i % 7)) {/*jshint ignore:line */
                        if (dayRows.length > 5 && curDate.otherMonth &&
                            ((curDate.yearNumber > selectedDate.yearNumber) ||
                            (curDate.monthNumber > selectedDate.monthNumber && curDate.yearNumber == selectedDate.yearNumber))) {
                            break;
                        }

                        days = [];
                        dayRows.push(days);
                    }
                    days.push(curDate);

                    date.setDate(date.getDate() + 1);
                }

                return dayRows;
            },
        }
    );

})();
