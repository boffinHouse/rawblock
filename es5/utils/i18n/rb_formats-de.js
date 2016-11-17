(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports !== "undefined") {
        factory();
    } else {
        var mod = {
            exports: {}
        };
        factory();
        global.rb_formatsDe = mod.exports;
    }
})(this, function () {
    "use strict";

    /* eslint-disable quotes */
    if (!window.rb) {
        window.rb = {};
    }

    if (!window.rb.i18n) {
        window.rb.i18n = {};
    }

    if (!window.rb.i18n.formats) {
        window.rb.i18n.formats = {};
    }

    window.rb.i18n.formats.de = {
        "numberFormat": {
            ",": ".",
            ".": ","
        },
        "timeSigns": ":. ",
        "numberSigns": ",",
        "dateSigns": ".",
        "patterns": {
            "d": "dd.mm.yy"
        },
        "clear": "Löschen",
        "previous": "Zurück",
        "next": "Vor",
        "today": "Heute",
        "monthNames": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
        "monthNamesShort": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
        "dayNames": ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
        "dayNamesShort": ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
        "dayNamesMin": ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
        "weekHeader": "KW",
        "firstDay": 1,
        "isRTL": false,
        "showMonthAfterYear": false,
        "yearSuffix": ""
    };
});
