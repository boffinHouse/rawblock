import rb from './global-rb';
import checkInViewport from './viewport';
import Callbacks from '../rb_$/$_callbacks';
import rbSymbol from './symbol';
import events from './events';

const intersectProp = rbSymbol('intersect');
const wait = Promise.resolve();

rb.intersects = function(element, margin, intersect){
    const intersectValue = element[intersectProp];

    margin = parseInt(margin, 10) || 0;
    intersect = parseFloat(intersect) || 0;

    return (intersectValue && intersectValue[margin] && intersectValue[margin][intersect]) ?
        intersectValue[margin][intersect].value :
        checkInViewport(element, margin, intersect)
        ;
};

function checkIntersect(e){
    let margin, intersectObj, intersect, inViewport;
    const element = e.target;
    const intersectValue = element[intersectProp];

    if(intersectValue){
        for(margin in intersectValue){
            if(intersectValue[margin]){
                for(intersect in intersectValue[margin]){
                    if((intersectObj = intersectValue[margin][intersect])){
                        inViewport = checkInViewport(element, intersectObj.margin, intersectObj.intersect);

                        if(intersectObj.value != inViewport){
                            intersectObj.value = inViewport;
                            intersectObj.cbs.fireWith(element, [{target: element, type: 'rb_intersect', inViewport: inViewport, originalEvent: e}]);
                        }
                    }
                }
            }
        }
    }
}

events.special.rb_intersect = {
    add: function (element, fn, opts) {
        let intersectValue = element[intersectProp];
        const margin = opts && opts.margin && parseInt(opts.margin, 10) || 0;
        const intersect = opts && opts.intersect && parseFloat(opts.intersect) || 0;

        if(!intersectValue){
            intersectValue = {};
            element[intersectProp] = intersectValue;

            events.add(element, 'rb_layoutchange', checkIntersect);
        }

        if(!intersectValue[margin]){
            intersectValue[margin] = {};
        }

        if(!intersectValue[margin][intersect]){
            intersectValue[margin][intersect] = {
                value: checkInViewport(element, margin, intersect),
                margin: margin,
                intersect: intersect,
                cbs: Callbacks(),
            };
        }

        intersectValue[margin][intersect].cbs.add(fn);

        if(intersectValue[margin][intersect].value){
            wait.then(function(){
                if(intersectValue[margin][intersect].value){
                    fn.call(element, {target: element, type: 'rb_intersect', inViewport: true, originalEvent: events.Event('initial')});
                }
            });
        }
    },
    remove: function (element, fn, opts) {
        let margin, intersect;
        let remove = true;
        const intersectValue = element[intersectProp];

        if(!intersectValue){
            return;
        }

        margin = opts && opts.margin && parseInt(opts.margin, 10) || 0;
        intersect = opts && opts.intersect && parseFloat(opts.intersect) || 0;

        if(!intersectValue[margin] || !intersectValue[margin][intersect]){return;}

        intersectValue[margin][intersect].cbs.remove(fn);

        if(!intersectValue[margin][intersect].cbs.has()){
            intersectValue[margin][intersect] = null;

            for(margin in intersectValue){
                for(intersect in intersectValue[margin]){
                    if(intersectValue[margin][intersect]){
                        remove = false;
                        break;
                    }
                }
            }

            if(remove){
                element[intersectProp] = null;
                events.remove(element, 'rb_layoutchange', checkIntersect);
            }
        }
    },
};

export default rb.intersects;
