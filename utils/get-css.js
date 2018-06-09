import getStyles from './get-styles';

const regComma = /^\d+,\d+(px|em|rem|%|deg)$/;

export const cssHooks = {};

export default function getCss(elem, name, extra, styles) {
    let ret, num;

    if (cssHooks[name] && cssHooks[name].get) {
        ret = cssHooks[name].get(elem);
    } else {
        styles = styles || getStyles(elem, null);
        ret = styles.getPropertyValue(name) || styles[name];
    }

    if(ret && regComma.test(ret)){
        ret = ret.replace(',', '.');
    }

    if (extra) {
        num = parseFloat(ret);
        if (extra === true || !isNaN(num)) {
            ret = num || 0;
        }
    }
    return ret;
}
