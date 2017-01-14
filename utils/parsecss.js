const rb = window.rb;
const defaultCSSProp = '--rb-cfg';
const watchCSSProp = '--rb-watch-css';

const regStartQuote = /^\s?"?'?"?/;
const regEndQuote = /"?'?"?\s?$/;
const regEscapedQuote = /\\"/g;

const removeLeadingQuotes = function (str) {
    return str && str.replace(regStartQuote, '').replace(regEndQuote, '').replace(regEscapedQuote, '"');
};

function getComponentCss(element, name){
    let prop, style, rets;

    let ret = 'null';
    const styles = rb.getStyles(element);
    const defaults = rb.components[name].defaults;

    name = '--' + name + '-';

    if(styles.getPropertyValue(watchCSSProp)){
        rets = [];

        for(prop in defaults){
            style = styles.getPropertyValue(name + prop);

            if(style){
                rets.push('"'+ prop +'":'+ removeLeadingQuotes(style));
            }
        }

        if(rets.length){
            ret = '{' + rets.join(',') + '}';
        }
    }

    return ret;
}

function parseCss(element, name){
    let styles = element.nodeType ? rb.getStyles(element) : element;

    return rb.jsonParse(
        removeLeadingQuotes(styles.getPropertyValue(name || defaultCSSProp) || '')
    );
}

function hasComponentCssChanged(element, name, symbol){
    const nowStyles = getComponentCss(element, name);
    const cachedStyles = element[symbol] && element[symbol][name];

    if(!element[symbol]){
        element[symbol] = {};
    }
    element[symbol][symbol] = nowStyles;

    return nowStyles != cachedStyles;
}

function parseComponentCss(element, name, symbol){
    const styles = element[symbol] && element[symbol][name] || getComponentCss(element, name);

    if(symbol){
        if(!element[symbol]){
            element[symbol] = {};
        }
        element[symbol][name] = styles;
    }

    return rb.jsonParse(styles);
}

rb.enableCustomCss = function(){
    rb.parseComponentCss = parseComponentCss;
    rb.hasComponentCssChanged = hasComponentCssChanged;
};

export default parseCss;
