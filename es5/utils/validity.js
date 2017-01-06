(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.validity = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var rb = window.rb;
    var $ = rb.$;
    var rules = {};
    var expando = rb.Symbol('validity');

    function addRule(rule) {
        $.extend(rules, $.extend({}, rule, { isAsync: false }));
    }

    function getCustomValidityInfo(element) {
        var validityInfo = element[expando];

        if (!validityInfo) {
            var $element = $(element);

            validityInfo = {
                element: element,
                $element: $element,
                data: $element.data(),
                rules: [],
                isPending: false,
                isDirty: true,
                errorRule: null
            };

            element[expando] = validityInfo;
        }

        return validityInfo;
    }

    function satifiesRule() {
        // todo
    }

    function checkAsyncRule() {
        // todo
    }

    function check(element) {
        var validityInfo = getCustomValidityInfo(element);
        var errorRule = validityInfo.errorRule;
        var validity = element.validity;
        var value = element.value;


        validityInfo.isDirty = true;

        if (validity.valid || validity.customError && errorRule && (errorRule.isAsync || satifiesRule(errorRule, validityInfo, value))) {

            var asyncRule = void 0;

            for (var ruleName in rules) {
                var currentRule = rules[ruleName];

                if (ruleName in validity.data && currentRule != errorRule && (currentRule.isAsync && (asyncRule = currentRule) || !satifiesRule(currentRule, validityInfo, value))) {
                    validityInfo.errorRule = currentRule;
                    break;
                }
            }

            if (asyncRule && !validityInfo.errorRule) {
                checkAsyncRule(asyncRule, validityInfo, value);
            }

            validityInfo.isDirty = false;
        }
    }

    var validity = { check: check, addRule: addRule };

    rb.validity = validity;

    exports.default = validity;
});
