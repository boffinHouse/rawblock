(function(window){
    'use strict';
    var document = window.document;
    var ASSETBASEPATH = window.siteData && siteData.basePath || '';
    var docElem = document.documentElement;
    var loadJs = function( src, ordered, cb ){
        var script = document.createElement( 'script');

        if(cb){
            script.addEventListener('load', cb);
        }

        script.src = src;
        script.async = !ordered;
        document.head.appendChild(script);
        return script;
    };
    /*ES6 support detection */
    //var es6support = (function(){
    //    var support = false;
    //    try {
    //        support = eval('(function(x=1){try{eval("((a=a)=>{}())");return !1;}catch(e){}try{eval("((a=b,b)=>{}())");return !1;}catch(e){}return !0;}())')
    //    } catch(e){}
    //    return support;
    //})();

    docElem.classList.remove('no-js');
    docElem.classList.add('js');

    setTimeout(function(){
        loadJs(ASSETBASEPATH + 'js/_crucial-behavior.js', true);
        loadJs(ASSETBASEPATH + 'js/_main-behavior.js', true);
    });


    //uncomment if you have crucial fonts placed above inline script
    //if (document.fonts && document.fonts.forEach) {
    //    (function(fonts){
    //        document.fonts.forEach(function(font){
    //            fonts.push(font);
    //        });
    //        setTimeout(function () {
    //            fonts.forEach(function(font){
    //                font.load();
    //            });
    //        }, 50);
    //    })([]);
    //}
})(window);
