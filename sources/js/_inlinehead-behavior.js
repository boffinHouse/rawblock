(function(window){
    'use strict';
    var document = window.document;
    var ASSETBASEPATH = window.siteData && siteData.basePath || '';
    var docElem = document.documentElement;
    var loadJs = function( src, ordered, cb ){
        var script = document.createElement( "script" );

        if(cb){
            script.addEventListener('load', cb);
        }

        script.src = src;
        script.async = !ordered;
        document.head.appendChild(script);
        return script;
    };
    /* if you need async CSS */
    //var loadCss = (function(){
    //    var supportsPreload;
    //    try {
    //        supportsPreload = document.createElement('link').relList.supports('preload');
    //    } catch(e){}
    //
    //    return function( href, media, callback ){
    //        var timer;
    //        var ss = document.createElement('link');
    //        var sheets = document.styleSheets;
    //
    //        var onLoad = function(){
    //            if(supportsPreload){
    //                ss.rel = 'stylesheet';
    //                timer = setInterval(onloadcssdefined, 19);
    //            }
    //            setTimeout(onloadcssdefined);
    //            ss.removeEventListener('load', onLoad);
    //        };
    //        var onloadcssdefined = function(){
    //            var resolvedHref = ss.href;
    //            var i = sheets.length;
    //            while( i-- ){
    //                if( sheets[ i ].href == resolvedHref ){
    //                    ss.media = media;
    //                    if(callback){
    //                        callback();
    //                    }
    //                    clearInterval(timer);
    //                    break;
    //                }
    //            }
    //        };
    //        var append = function(){
    //            document.head.appendChild(ss);
    //        };
    //
    //        media = media || 'all';
    //
    //        if(supportsPreload){
    //            ss.rel = 'preload';
    //            ss.as = 'style';
    //            ss.media = media;
    //        } else {
    //            timer = setInterval(onloadcssdefined, 19);
    //            ss.rel = 'stylesheet';
    //            ss.media = 'x';
    //        }
    //
    //        ss.addEventListener('load', onLoad);
    //
    //        ss.href = href;
    //
    //        if(supportsPreload || !document.msElementsFromPoint || document.body){
    //            append();
    //        } else {
    //            requestAnimationFrame(append);
    //        }
    //
    //        return ss;
    //    };
    //})();
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

    //loadCss(ASSETBASEPATH + 'css/styles.async.css');

    setTimeout(function(){
        //loadJs(ASSETBASEPATH + 'js/_crucial-behavior.js', true);
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
