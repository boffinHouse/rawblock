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

	/**
     *
     * @param element
     * @param [margin]
     * @param [viewportWidth]
     * @param [viewportHeight]
     */
    rb.checkInViewport = function(element, margin, viewportWidth, viewportHeight){
        var top = 0;
        var left = 0;
        var right = viewportWidth || window.innerWidth;
        var bottom = viewportHeight || window.innerHeight;
        var box = element.getBoundingClientRect();

        if(margin){
            top -= margin;
            left -= margin;
            right += margin;
            bottom += margin;
        }

        return (box.top <= bottom && box.bottom >= top && box.left <= right && box.right >= left);
    };

    return rb.checkInViewport;
}));
