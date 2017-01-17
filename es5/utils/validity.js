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
    exports.addRule = addRule;
    exports.getCustomValidityInfo = getCustomValidityInfo;
    exports.checkElement = checkElement;
    exports.check = check;
    exports.willValidate = willValidate;
    exports.getVisibleElements = getVisibleElements;
    exports.getInvalidVisibleElements = getInvalidVisibleElements;
    /**
     * @module validity
     */

    var rb = window.rb;
    var $ = rb.$;
    var rules = {};
    var checkedTypes = { radio: !0, checkbox: !0 };
    var expando = rb.Symbol('validity');

    /**
     * This callback is displayed as a global member.
     * @callback customValidationRuleCallback
     * @param {customValidationElementInfo} validityInfo
     *
     * @returns {Boolean|Promise|deferred}
     */
    /**
     * @typedef {Object} customValidationElementInfo
     * @property {Element} element Reference to the element.
     * @property {Object} $element jQuerified version of element.
     * @property {Object} data Data object of the element. Retrieved by $element.data().
     * @property {Object|null} errorRule Current validation rule that the element lacks of.
     * @property {null|String[]|String} value The value that was used on last validation.
     * @property {undefined|String} valueStr The value as string that was used on last validation.
     * @property {null|String[]|String} prev The value that the was used on the validation before.
     * @property {false|Promise|Deferred} isPending The value that the was used on the validation before.
     */

    /**
     * Adds a new custom validation rule to the set.
     * @param rule {Object}
     * @param rule.name {String} Name of the custom validation rule.
     * @param rule.rule {customValidationRuleCallback} The function that runs the validation. Returns false if the rule is not satisfied otherwise false. In case of async validation it has to return a promise/deferred.
     * @param [rule.message='This field is invalid.'] {String} Default validation message.
     * @param [rule.isAsync=false] {Boolean} In case the rule works async.
     * @param [rule.isDependent=false] {Boolean} In case the rule not only depends on the value of one field.
     *
     * @example
     *
     * //<input data-val-foo="This field has to contain 'foo'" />
     * //or
     * //<input data-foo="" />
     * addRule({
     *     name: 'foo',
     *     rule(validityInfo){
     *         return validityInfo.value.includes('foo');
     *     }
     * });
     */
    function addRule(rule) {
        rule = Object.assign({
            isAsync: false,
            isDependent: false,
            message: 'This field is invalid.'
        }, rule);

        if (!rule.messageAttr) {
            rule.messageAttr = $.camelCase('val-' + rule.name);
        }

        rule.normalizedName = $.camelCase(rule.name);

        rules[rule.normalizedName] = rule;
        rules[rule.messageAttr] = rule;
    }

    /**
     * Returns the validityData of an element.
     *
     * @param element
     * @return {customValidationElementInfo}
     */
    function getCustomValidityInfo(element) {
        var validityInfo = element[expando];

        if (!validityInfo) {
            var $element = $(element);

            validityInfo = {
                element: element,
                $element: $element,
                prev: null,
                value: null,
                data: $element.data(),
                isPending: false,
                errorRule: null
            };

            element[expando] = validityInfo;
        }

        return validityInfo;
    }

    function applyErrorMessage(validityInfo) {
        var errorRule = validityInfo.errorRule;

        var message = errorRule ? validityInfo.data[errorRule.messageAttr] || errorRule.message : '';

        validityInfo.element.setCustomValidity(message);
    }

    function applyValidity(isValid, errorRule, validityInfo) {

        if (!isValid) {
            validityInfo.errorRule = errorRule;
            applyErrorMessage(validityInfo);
        } else if (validityInfo.errorRule == errorRule) {
            validityInfo.errorRule = null;
            applyErrorMessage(validityInfo);
        }
    }

    function satifiesRule(errorRule, validityInfo) {
        if (!validityInfo.isChanged && !errorRule.isDependent) {
            return validityInfo.errorRule == errorRule ? false : true;
        }

        var isValid = errorRule.rule(validityInfo);

        applyValidity(isValid, errorRule, validityInfo);

        return isValid;
    }

    function checkAsyncRule(asyncRule, validityInfo) {

        if (!validityInfo.isChanged && !asyncRule.isDependent) {
            return;
        }

        validityInfo.isPending = asyncRule.rule(validityInfo);

        validityInfo.isPending.then(function (isValid) {
            validityInfo.isPending = null;
            applyValidity(isValid, asyncRule, validityInfo);
        }).catch(function () {
            validityInfo.isPending = null;
            applyValidity(true, asyncRule, validityInfo);
        });
    }

    function getValue(element) {
        var value = '';
        var valueStr = '';

        if (checkedTypes[element.type]) {
            value = element.checked ? element.value : '';
            valueStr = value;
        } else if ((element.multiple || element.size > 1) && element.matches('select')) {
            value = $(':checked:not([disabled])', element).get().map(function (option) {
                return option.value;
            });
            valueStr = value.join(', ');
        } else {
            value = element.value;
            valueStr = value;
        }

        return [value, valueStr];
    }

    /**
     * Runs custom validation rules on an element. Returns a promise if the validation is pending otherwise false.
     *
     * @param element {Element}
     * @return {false|Promise|Deferred}
     *
     * @example
     *
     * checkElement(element);
     * console.log(element.validity.valid);
     */
    function checkElement(element) {
        if (!element.willValidate) {
            return;
        }

        var validityInfo = getCustomValidityInfo(element);
        var errorRule = validityInfo.errorRule;
        var validity = element.validity;


        if (validity.valid || validity.customError && errorRule) {
            var asyncRule = void 0;

            var _getValue = getValue(element);

            var value = _getValue[0];
            var valueStr = _getValue[1];


            validityInfo.value = value;
            validityInfo.valueStr = valueStr;
            validityInfo.isChanged = valueStr !== validityInfo.prev;

            if (!errorRule || errorRule.isAsync || satifiesRule(errorRule, validityInfo)) {

                for (var ruleName in rules) {
                    var currentRule = rules[ruleName];

                    if (ruleName in validityInfo.data && (currentRule.messageAttr != ruleName || !(currentRule.normalizedName in validityInfo.data))) {
                        if (currentRule.isAsync) {
                            asyncRule = currentRule;
                            continue;
                        }

                        if (currentRule != errorRule && !satifiesRule(currentRule, validityInfo)) {
                            break;
                        }
                    }
                }

                if (asyncRule && (!validityInfo.errorRule || validityInfo.errorRule == asyncRule)) {
                    checkAsyncRule(asyncRule, validityInfo);
                }

                validityInfo.prev = valueStr;
            }
        }

        return validityInfo.isPending;
    }

    /**
     * Runs checkElement on multiple elements.
     *
     * @param element {Element|Element[]|HTMLFormElement|FieldsetFormElement}
     * @return {Promise|false}
     */
    function check(element) {
        var pendings = false;

        (Array.isArray(element) ? element : element.elements && Array.from(element.elements) || [element]).forEach(function (element) {
            var pending = checkElement(element);

            if (pending) {
                if (!pendings) {
                    pendings = [];
                }

                pendings.push(pending);
            }
        });

        return pendings ? Promise.all(pendings) : pendings;
    }

    function willValidate(element) {
        return element.willValidate && element.type != 'submit' && !element.matches('[aria-hidden="true"] *, [hidden] *');
    }

    /**
     * Returns all elements that are considered to be validated inside of contextElement.
     * @param contextElement
     *
     * @return {Element[]}
     */
    function getVisibleElements(contextElement) {
        return $('input, select, textarea', contextElement).get().filter(willValidate);
    }

    /**
     * Returns all elements that are invalid inside of contextElement.
     * @param contextElement
     *
     * @return {Element[]}
     */
    function getInvalidVisibleElements(element) {
        return $('input:invalid, select:invalid, textarea:invalid', element).get().filter(willValidate);
    }

    var validity = { checkElement: checkElement, check: check, addRule: addRule, getInvalidVisibleElements: getInvalidVisibleElements, getCustomValidityInfo: getCustomValidityInfo, willValidate: willValidate, getVisibleElements: getVisibleElements };

    rb.validity = validity;

    exports.default = validity;
});
