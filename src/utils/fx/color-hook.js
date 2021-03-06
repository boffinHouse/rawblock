const rb = window.rb;
const $ = rb.$;

const regWhite = /\s\s*/g;
const regSixHex = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/;
const regThreeHex = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/;
const regRgba = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/;
const regRgb = /^rgb\(([\d]+),([\d]+),([\d]+)\)/;
const parseInt = parseInt;

const parseColor = function(color){
    let matchedColor;
    let parsedColor = [0,0,0,0];

    color = color.replace(regWhite, '');

    if ((matchedColor = regSixHex.exec(color))){
        parsedColor = [parseInt(matchedColor[1], 16), parseInt(matchedColor[2], 16), parseInt(matchedColor[3], 16)];
    } else if ((matchedColor = regThreeHex.exec(color))){
        parsedColor = [parseInt(matchedColor[1], 16) * 17, parseInt(matchedColor[2], 16) * 17, parseInt(matchedColor[3], 16) * 17];
    } else if ((matchedColor = regRgba.exec(color))){
        parsedColor = [+matchedColor[1], +matchedColor[2], +matchedColor[3], +matchedColor[4]];
    } else if ((matchedColor = regRgb.exec(color))){
        parsedColor = [+matchedColor[1], +matchedColor[2], +matchedColor[3]];
    }

    // Performs RGBA conversion by default
    if(parsedColor[3] == null || isNaN(parsedColor[3])){
        parsedColor[3] = 1;
    }

    return parsedColor;
};

['backgroundColor', 'color', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'columnRuleColor', 'outlineColor', 'textDecorationColor', 'textEmphasisColor'].forEach(function(name){
    if(!$.fx.step[name]){

        $.fx.step[name] = function( fx ) {
            let i, tmpValue;

            if(!fx.parsedColors){
                fx.parsedColors = {
                    start: parseColor(fx.start),
                    end: parseColor(fx.end),
                };
            }

            fx.now = [];

            for(i = 0; i < fx.parsedColors.start.length; i++){
                tmpValue = (fx.parsedColors.end[i] - fx.parsedColors.start[i]) * fx.pos + fx.parsedColors.start[i];

                if(i != 3){
                    tmpValue = Math.round(tmpValue);
                }

                fx.now.push(tmpValue);
            }

            fx.elem.style[name] = 'rgba('+ fx.now.join(',') +')';
        };
    }
});
