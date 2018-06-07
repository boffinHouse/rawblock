import rb from '../utils/global-rb';
import rAFQueue from '../utils/rafqueue';
import getStyles from '../utils/get-styles';
import getCss from '../utils/get-css';
import getCSSNumbers from '../utils/get-css-numbers';

export default function addDimensions(Dom, asyncDefault){
    let added, isBorderBoxRelieable;
    let div = document.createElement('div');
    const fn = Dom.fn;

    const read = function(){
        let width;

        if(isBorderBoxRelieable == null && div){
            width = parseFloat(getStyles(div).width);

            isBorderBoxRelieable = width < 4.02 && width > 3.98;

            rAFQueue(function(){
                if(div){
                    div.remove();
                    div = null;
                }
            }, true);
        }
    };

    const add = function(){
        if(!added){
            added = true;
            document.documentElement.appendChild(div);

            setTimeout(read, 0);
        }
    };

    const boxSizingReliable = function(){
        if(isBorderBoxRelieable == null){
            add();
            read();
        }
        return isBorderBoxRelieable;
    };

    div.style.cssText = 'position:absolute;top:0;visibility:hidden;' +
        'width:4px;border:0;padding:1px;box-sizing:border-box;';

    if(window.CSS && CSS.supports && CSS.supports('box-sizing', 'border-box')){
        isBorderBoxRelieable = true;
    } else {
        rAFQueue(add, true);
    }

    Dom.support.boxSizingReliable = boxSizingReliable;

    [['height', 'Height'], ['width', 'Width']].forEach(function(names){
        const cssName = names[0];
        const extras = cssName == 'height' ? ['Top', 'Bottom'] : ['Left', 'Right'];

        ['inner', 'outer', ''].forEach(function(modifier){
            const fnName = modifier ? modifier + names[1] : names[0];
            const oldFn = fn[fnName];
            const outerName = `outer${names[1]}`;

            fn[fnName] = function(margin, ...rest){
                const isSync = margin == 'sync';

                if(oldFn && ((margin != 'async' && !asyncDefault) || isSync)){
                    return oldFn.apply(this, isSync ? rest : arguments);
                }

                let styles, extraStyles, isBorderBox, doc;
                let ret = 0;
                const elem = this.get(0);

                if(margin == 'async'){
                    margin = rest && rest[0];
                }

                if(margin != null && typeof margin == 'number'){
                    this.each(function(){
                        const $elem = new Dom(elem);
                        const size = $elem[outerName]() - $elem[fnName]();

                        rAFQueue(()=>{
                            $elem.css({[cssName]: margin + size});
                        }, true);
                    });

                    return this;
                }

                if(elem){
                    if(elem.nodeType == 9){
                        doc = elem.documentElement;
                        ret = Math.max(
                            elem.body[ 'scroll' + names[1] ], doc[ 'scroll' + names[1] ],
                            elem.body[ 'offset' + names[1] ], doc[ 'offset' + names[1] ],
                            doc[ 'client' + names[1] ]
                        );
                    } else if(elem.nodeType){
                        styles = getStyles(elem);
                        ret = getCss(elem, cssName, true, styles);
                        isBorderBox = styles.boxSizing == 'border-box' && boxSizingReliable();

                        switch (modifier){
                            case '':
                                if(isBorderBox){
                                    extraStyles = [
                                        'border'+ extras[0] +'Width',
                                        'border'+ extras[1] +'Width',
                                        'padding' + extras[0],
                                        'padding' + extras[1],
                                    ];

                                    ret -= getCSSNumbers(elem, extraStyles, true);
                                }
                                break;
                            case 'inner':
                                if(isBorderBox){
                                    extraStyles = [
                                        'border'+ extras[0] + 'Width',
                                        'border'+ extras[1] + 'Width',
                                    ];
                                    ret -= getCSSNumbers(elem, extraStyles, true);
                                } else {
                                    extraStyles = [
                                        'padding' + extras[0],
                                        'padding' + extras[1],
                                    ];

                                    ret += getCSSNumbers(elem, extraStyles, true);
                                }
                                break;
                            case 'outer':
                                if(!isBorderBox){
                                    extraStyles = [
                                        'border'+ extras[0] + 'Width',
                                        'border'+ extras[1] + 'Width',
                                        'padding' + extras[0],
                                        'padding' + extras[1],
                                    ];
                                    ret += getCSSNumbers(elem, extraStyles, true);
                                }

                                if(margin === true){
                                    ret += getCSSNumbers(elem, ['margin' + extras[0], 'margin' + extras[1]], true);
                                }
                                break;
                            default:
                                window.rb && window.rb.logWarn && rb.logWarn('no modifiert', modifier);
                        }
                    } else if('innerWidth' in elem){
                        ret = (modifier == 'outer') ?
                            elem[ 'inner' + names[1] ] :
                            elem.document.documentElement[ 'client' + names[1] ]
                        ;
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
    if(!rb.$){
        rb.$ = Dom;
    }
}

