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
		global.formDe = mod.exports;
	}
})(this, function () {
	"use strict";

	/* eslint-disable quotes */
	window.rbValidation = window.rbValidation || {};
	window.rbValidation.messages = window.rbValidation.messages || {};

	window.rbValidation.messages.de = {
		"typeMismatch": {
			"defaultMessage": "Geben Sie einen zulässigen Wert ein.",
			"number": "Geben Sie eine Nummer ein.",
			"date": "Geben Sie ein Datum ein.",
			"time": "Geben Sie eine Uhrzeit ein.",
			"month": "Geben Sie einen Monat mit Jahr ein.",
			"range": "Geben Sie eine Nummer.",
			"datetime-local": "Geben Sie ein Datum mit Uhrzeit ein.",
			"email": "{%value} ist keine gültige E-Mail-Adresse.",
			"url": "{%value} ist kein(e) gültige(r) Webadresse/Pfad."
		},
		"rangeUnderflow": {
			"defaultMessage": "{%value} ist zu niedrig. {%min} ist der unterste Wert, den Sie benutzen können.",
			"date": "{%value} ist zu früh. {%min} ist die früheste Zeit, die Sie benutzen können.",
			"time": "{%value} ist zu früh. {%min} ist die früheste Zeit, die Sie benutzen können.",
			"datetime-local": "{%value} ist zu früh. {%min} ist die früheste Zeit, die Sie benutzen können.",
			"month": "{%value} ist zu früh. {%min} ist die früheste Zeit, die Sie benutzen können."
		},
		"rangeOverflow": {
			"defaultMessage": "{%value} ist zu hoch. {%max} ist der oberste Wert, den Sie benutzen können.",
			"date": "{%value} ist zu spät. {%max} ist die späteste Zeit, die Sie benutzen können.",
			"time": "{%value} ist zu spät. {%max} ist die späteste Zeit, die Sie benutzen können.",
			"datetime-local": "{%value} ist zu spät. {%max} ist die späteste Zeit, die Sie benutzen können.",
			"month": "{%value} ist zu spät. {%max} ist die späteste Zeit, die Sie benutzen können."
		},
		"stepMismatch": "Der Wert {%value} ist in diesem Feld nicht zulässig. Hier sind nur bestimmte Werte zulässig. {%title}",
		"tooLong": "Der eingegebene Text ist zu lang! Sie haben {%valueLen} Zeichen eingegeben, dabei sind {%maxlength} das Maximum.",
		"tooShort": "Der eingegebene Text ist zu kurz! Sie haben {%valueLen} Zeichen eingegeben, dabei sind {%minlength} das Minimum.",
		"patternMismatch": "{%value} hat für dieses Eingabefeld ein falsches Format. {%title}",
		"valueMissing": {
			"defaultMessage": "Bitte geben Sie einen Wert ein.",
			"checkbox": "Bitte aktivieren Sie das Kästchen.",
			"select": "Bitte wählen Sie eine Option aus.",
			"radio": "Bitte wählen Sie eine Option aus."
		}
	};

	window.rbValidation.messages[''] = window.rbValidation.messages.de;
});
