(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '../utils/global-rb', '../utils/rafqueue', '../utils/get-styles', '../utils/getCSSNumbers'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('../utils/global-rb'), require('../utils/rafqueue'), require('../utils/get-styles'), require('../utils/getCSSNumbers'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.globalRb, global.rafqueue, global.getStyles, global.getCSSNumbers);
        global.$_dimensions = mod.exports;
    }
})(this, function (exports, _globalRb, _rafqueue, _getStyles, _getCSSNumbers) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = addDimensions;

    var _globalRb2 = _interopRequireDefault(_globalRb);

    var _rafqueue2 = _interopRequireDefault(_rafqueue);

    var _getStyles2 = _interopRequireDefault(_getStyles);

    var _getCSSNumbers2 = _interopRequireDefault(_getCSSNumbers);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function addDimensions(Dom, asyncDefault) {
        var added = void 0,
            isBorderBoxRelieable = void 0;
        var div = document.createElement('div');
        var fn = Dom.fn;

        var read = function read() {
            var width = void 0;

            if (isBorderBoxRelieable == null && div) {
                width = parseFloat((0, _getStyles2.default)(div).width);

                isBorderBoxRelieable = width < 4.02 && width > 3.98;

                (0, _rafqueue2.default)(function () {
                    if (div) {
                        div.remove();
                        div = null;
                    }
                }, true);
            }
        };

        var add = function add() {
            if (!added) {
                added = true;
                document.documentElement.appendChild(div);

                setTimeout(read, 0);
            }
        };

        var boxSizingReliable = function boxSizingReliable() {
            if (isBorderBoxRelieable == null) {
                add();
                read();
            }
            return isBorderBoxRelieable;
        };

        div.style.cssText = 'position:absolute;top:0;visibility:hidden;' + 'width:4px;border:0;padding:1px;box-sizing:border-box;';

        if (window.CSS && CSS.supports && CSS.supports('box-sizing', 'border-box')) {
            isBorderBoxRelieable = true;
        } else {
            (0, _rafqueue2.default)(add, true);
        }

        Dom.support.boxSizingReliable = boxSizingReliable;

        [['height', 'Height'], ['width', 'Width']].forEach(function (names) {
            var cssName = names[0];
            var extras = cssName == 'height' ? ['Top', 'Bottom'] : ['Left', 'Right'];

            ['inner', 'outer', ''].forEach(function (modifier) {
                var fnName = modifier ? modifier + names[1] : names[0];
                var oldFn = fn[fnName];
                var outerName = 'outer' + names[1];

                fn[fnName] = function (margin) {
                    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                        rest[_key - 1] = arguments[_key];
                    }

                    var isSync = margin == 'sync';

                    if (oldFn && (margin != 'async' && !asyncDefault || isSync)) {
                        return oldFn.apply(this, isSync ? rest : arguments);
                    }

                    var styles = void 0,
                        extraStyles = void 0,
                        isBorderBox = void 0,
                        doc = void 0;
                    var ret = 0;
                    var elem = this.get(0);

                    if (margin == 'async') {
                        margin = rest && rest[0];
                    }

                    if (margin != null && typeof margin == 'number') {
                        this.each(function () {
                            var $elem = new Dom(elem);
                            var size = $elem[outerName]() - $elem[fnName]();

                            (0, _rafqueue2.default)(function () {
                                var _$elem$css;

                                $elem.css((_$elem$css = {}, _$elem$css[cssName] = margin + size, _$elem$css));
                            }, true);
                        });

                        return this;
                    }

                    if (elem) {
                        if (elem.nodeType == 9) {
                            doc = elem.documentElement;
                            ret = Math.max(elem.body['scroll' + names[1]], doc['scroll' + names[1]], elem.body['offset' + names[1]], doc['offset' + names[1]], doc['client' + names[1]]);
                        } else if (elem.nodeType) {
                            styles = (0, _getStyles2.default)(elem);
                            ret = Dom.css(elem, cssName, true, styles);
                            isBorderBox = styles.boxSizing == 'border-box' && boxSizingReliable();

                            switch (modifier) {
                                case '':
                                    if (isBorderBox) {
                                        extraStyles = ['border' + extras[0] + 'Width', 'border' + extras[1] + 'Width', 'padding' + extras[0], 'padding' + extras[1]];

                                        ret -= (0, _getCSSNumbers2.default)(elem, extraStyles, true);
                                    }
                                    break;
                                case 'inner':
                                    if (isBorderBox) {
                                        extraStyles = ['border' + extras[0] + 'Width', 'border' + extras[1] + 'Width'];
                                        ret -= (0, _getCSSNumbers2.default)(elem, extraStyles, true);
                                    } else {
                                        extraStyles = ['padding' + extras[0], 'padding' + extras[1]];

                                        ret += (0, _getCSSNumbers2.default)(elem, extraStyles, true);
                                    }
                                    break;
                                case 'outer':
                                    if (!isBorderBox) {
                                        extraStyles = ['border' + extras[0] + 'Width', 'border' + extras[1] + 'Width', 'padding' + extras[0], 'padding' + extras[1]];
                                        ret += (0, _getCSSNumbers2.default)(elem, extraStyles, true);
                                    }

                                    if (margin === true) {
                                        ret += (0, _getCSSNumbers2.default)(elem, ['margin' + extras[0], 'margin' + extras[1]], true);
                                    }
                                    break;
                                default:
                                    window.rb && window.rb.logWarn && _globalRb2.default.logWarn('no modifiert', modifier);
                            }
                        } else if ('innerWidth' in elem) {
                            ret = modifier == 'outer' ? elem['inner' + names[1]] : elem.document.documentElement['client' + names[1]];
                        }
                    }

                    return ret;
                };
            });
        });

        /**
         * @memberOf rb
         * @type Function
         *
         * @param elements {String|Element|NodeList|Array]
         *
         * @returns {jQueryfiedDOMList}
         */
        if (!_globalRb2.default.$) {
            _globalRb2.default.$ = Dom;
        }
    }
});
