(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    /* jshint eqnull: true */
    var rb = window.rb;
    var $ = rb.$;
    var mutationProp = rb.Symbol('mutate');

    var createObserver = function(element, fn, opts){
        new MutationObserver(fn).observe( element, {childList: true, subtree: true} );
    };

    function addObserver(element, mutationObj, opts){

        var observer = function(mutationRecords){
            console.log(mutationRecords);
            var recordIndex, recordLength, mutation, mutationIndex, mutationLength;

            for(recordIndex = 0, recordLength = mutationRecords.length; recordIndex < recordLength; recordIndex++){
                for(mutationIndex = 0, mutationLength = mutationRecords[recordIndex].length; mutationIndex < mutationLength; mutationIndex++){
                    mutation = mutationRecords[recordIndex][mutationIndex];
                }
            }
        };

        createObserver(element, observer, opts);
    }

    rb.events.special.rb_mutate = {
        add: function (element, fn, opts) {
            opts = opts || {};

            var mutationObj = element[mutationProp];
            var selector = (opts.selector || '*').trim();
            var onlyMatches = opts.onlyMatches ? 'matches' : 'query';
            var key = onlyMatches + '_' + selector;

            if(!mutationObj){
                mutationObj = {};
                addObserver(element, mutationObj, opts);
                element[mutationProp] = mutationObj;
            }

            if(!mutationObj[key]){
                mutationObj[key] = {
                    selector: selector,
                    onlyMatches: onlyMatches,
                    cbs: $.Callbacks(),
                };
            }

            mutationObj[key].cbs.add(fn);
        },
        remove: function (element, fn, opts) {
            opts = opts || {};

            var mutationObj = element[mutationProp];
            var selector = (opts.selector || '*').trim();
            var onlyMatches = opts.onlyMatches ? 'matches' : 'query';
            var key = onlyMatches + '_' + selector;

            if(mutationObj && mutationObj[key]){
                mutationObj[key].cbs.remove(fn);

                if(!mutationObj[key].cbs.has()){
                    mutationObj[key] = null;
                }
            }
        }
    };


    return rb.events.special.rb_mutate;
}));
