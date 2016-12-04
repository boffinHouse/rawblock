const rb = window.rb;
const $ = rb.$;
const mutationProp = rb.Symbol('mutate');

const createObserver = function(element, fn, opts){
    if(window.MutationObserver){
        new MutationObserver(fn).observe( element, {childList: true, subtree: !opts.onlyChilds} );
    } else {
        rb.logWarn('no MutationObserver');
    }
};

const rb_mutate = {
    /**
     * @memberOf rb.events.special.rb_mutate
     * @param {Element} element
     * @param {Function} handler
     * @param {Object} [options]
     * @param {String} [options.selector=*] Selector to search in added and removed Nodes for. (* is fastest)
     * @param {Boolean} [options.onlyMatches=false] Checks only added/removed nodes for matches against selector, but doesn't search inside those nodes for selector. (onlyMatches=true is faster).
     * @param {Boolean} [options.onlyChilds=false] Checks only whether childs of `element` and not the hole subtree. (onlyChilds=true is faster)
     *
     * @example
     * //usage in events object of component:
     * 'rb_mutate:selector(.{name}-cell)': 'onCellChanged',
     * //improved performance:
     * 'rb_mutate:selector(.{name}-cell):onlyMatches()': 'onCellChanged',
     * //even more improved performance:
     * 'rb_mutate:@(find(.{name}-content)):selector(.{name}-cell):onlyMatches():onlyChilds()': 'onCellChanged',
     */
    add: function (element, handler, options) {
        options = options || {};

        let mutationObj = element[mutationProp];

        const selector = (options.selector || '*').trim();
        const onlyMatches = options.onlyMatches ? 'matches' : 'query';
        const observerKey = options.onlyChilds ? 'childList' : 'subtree';
        const key = onlyMatches + '_' + selector;

        if(!mutationObj){
            mutationObj = {};
            element[mutationProp] = mutationObj;
        }

        if(!mutationObj[observerKey]){
            mutationObj[observerKey] = {
                everything: true,
                observers: {},
            };
            addObserver(element, mutationObj[observerKey], options);
        }

        if(mutationObj[observerKey].everything){
            mutationObj[observerKey].everything = selector == '*';
        }

        if(!mutationObj[observerKey].observers[key]){
            mutationObj[observerKey].observers[key] = {
                selector: selector,
                onlyMatches: options.onlyMatches,
                cbs: $.Callbacks(),
            };
        }

        mutationObj[observerKey].observers[key].cbs.add(handler);
    },
    remove: function (element, fn, opts) {
        opts = opts || {};

        const mutationObj = element[mutationProp];
        const selector = (opts.selector || '*').trim();
        const onlyMatches = opts.onlyMatches ? 'matches' : 'query';
        const key = onlyMatches + '_' + selector;

        if(mutationObj && mutationObj[key]){
            mutationObj[key].cbs.remove(fn);

            if(!mutationObj[key].cbs.has()){
                mutationObj[key] = null;
            }
        }
    },
    _isRelevantMutation: function(nodeList, observer){
        let i, len;
        let ret = observer.selector == '*' && !!nodeList.length;

        for(i = 0, len = nodeList.length; i < len && !ret; i++){
            if(nodeList[i].matches(observer.selector) || (!observer.onlyMatches && nodeList[i].querySelector(observer.selector))){
                ret = true;
                break;
            }
        }

        return ret;
    },
    isRelevantMutation: function(mutationRecord, observer){
        return this._isRelevantMutation(mutationRecord.addedNodes, observer) || this._isRelevantMutation(mutationRecord.removedNodes, observer);
    },
};

function addObserver(element, observersObj, opts){

    const observer = function(mutationRecords){
        let recordIndex, recordLength, mutation, observerProp, event, observer, calledObservers;

        if(observersObj.everything){
            for(observerProp in observersObj.observers){
                if(!event){
                    event = [{type: 'rb_mutate', target: element, mutationRecords: mutationRecords}];
                }
                observersObj.observers[observerProp].cbs.fireWith(element, event);
            }
        } else {
            for(recordIndex = 0, recordLength = mutationRecords.length; recordIndex < recordLength; recordIndex++){
                mutation = mutationRecords[recordIndex];
                for(observerProp in observersObj.observers){
                    observer = observersObj.observers[observerProp];
                    if((!calledObservers || !calledObservers[observerProp]) && rb_mutate.isRelevantMutation(mutation, observer)){
                        if(!event){
                            event = [{type: 'rb_mutate', target: element, mutationRecords: mutationRecords}];
                        }
                        if(!calledObservers){
                            calledObservers = {};
                        }
                        calledObservers[observerProp] = true;
                        observer.cbs.fireWith(element, event);
                    }
                }
            }
        }
    };

    createObserver(element, observer, opts);
}

rb.events.special.rb_mutate = rb_mutate;

export default rb_mutate;
