(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';

    if (!window.rb) {
        window.rb = {};
    }

    var rb = window.rb;
    var $ = rb.$;

    var elementResize = {
        add: function (element, fn, options) {
            var that;
            if (!element[elementResize.expando]) {
                element[elementResize.expando] = {
                    width: element.offsetWidth,
                    height: element.offsetHeight,
                    cbs: $.Callbacks(),
                    widthCbs: $.Callbacks(),
                    heightCbs: $.Callbacks(),
                    wasStatic: rb.getStyles(element).position == 'static',
                };

                that = this;

                rb.rIC(function(){
                    that.addMarkup(element, element[elementResize.expando]);
                });
            }

            if (options && options.noWidth) {
                element[elementResize.expando].heightCbs.add(fn);
            } else if (options && options.noHeight) {
                element[elementResize.expando].widthCbs.add(fn);
            } else {
                element[elementResize.expando].cbs.add(fn);
            }
            return element[elementResize.expando];
        },
        remove: function (element, fn) {
            if (element[elementResize.expando]) {
                element[elementResize.expando].cbs.remove(fn);
                element[elementResize.expando].heightCbs.remove(fn);
                element[elementResize.expando].widthCbs.remove(fn);
            }
        },
        expando: rb.Symbol('_elementResize'),
        addMarkup: rb.rAF(function (element, data) {
            var fire, widthChange, heightChange;
            var first = true;
            var expandElem, shrinkElem, expandChild, block;
            var posStyle = 'position:absolute;top:0;left:0;display: block;'; //
            var wrapperStyle = posStyle + 'bottom:0;right:0;';
            var wrapper = document.createElement('span');

            var addEvents = function () {
                expandElem.addEventListener('scroll', onScroll);
                shrinkElem.addEventListener('scroll', onScroll);
            };

            var runFire = function () {

                if (heightChange) {
                    element[elementResize.expando].heightCbs.fire(data);
                }
                if (widthChange) {
                    element[elementResize.expando].widthCbs.fire(data);
                }

                data.cbs.fire(data);

                heightChange = false;
                widthChange = false;
                block = false;
            };

            var scrollWrite = function () {
                expandElem.scrollLeft = data.exScrollLeft;
                expandElem.scrollTop = data.exScrollTop;
                shrinkElem.scrollLeft = data.shrinkScrollLeft;
                shrinkElem.scrollTop = data.shrinkScrollTop;

                if (fire) {
                    runFire();
                }

                if (first) {
                    first = false;
                    addEvents();
                }
            };

            var write = rb.rAF(function () {
                expandChild.style.width = data.exChildWidth;
                expandChild.style.height = data.exChildHeight;
                setTimeout(scrollWrite, 9);
            }, {throttle: true});

            var read = function () {
                data.exChildWidth = expandElem.offsetWidth + 9 + 'px';
                data.exChildHeight = expandElem.offsetHeight + 9 + 'px';

                data.exScrollLeft = expandElem.scrollWidth;
                data.exScrollTop = expandElem.scrollHeight;

                data.shrinkScrollLeft = shrinkElem.scrollWidth;
                data.shrinkScrollTop = shrinkElem.scrollHeight;

                write();
            };
            var onScroll = rb.throttle(function () {
                if (block) {
                    return;
                }

                var width = element.offsetWidth;
                var height = element.offsetHeight;

                var curWidthChange = width != data.width;
                var curHeightChange = height != data.height;

                fire = curHeightChange || curWidthChange;

                if (fire) {
                    widthChange = curWidthChange || widthChange;
                    heightChange = curHeightChange || heightChange;
                    data.height = height;
                    data.width = width;
                    block = widthChange && heightChange;
                    read();
                }

            }, {read: true});

            wrapper.className = 'js' + rb.nameSeparator + 'element' + rb.nameSeparator + 'resize';
            wrapper.setAttribute('style', wrapperStyle + 'visibility:hidden;z-index: -1;opacity: 0;-webkit-overflow-scrolling:auto;');
            wrapper.innerHTML = '<span style="' + wrapperStyle + 'overflow: scroll;-webkit-overflow-scrolling:auto;">' +
                '<span style="' + posStyle + '"></span>' +
                '</span>' +
                '<span style="' + wrapperStyle + 'overflow: scroll;-webkit-overflow-scrolling:auto;">' +
                '<span style="' + posStyle + 'width: 200%; height: 200%;"></span>' +
                '</span>';

            expandElem = wrapper.children[0];
            shrinkElem = wrapper.children[1];
            expandChild = expandElem.children[0];

            if (data.wasStatic) {
                element.style.position = 'relative';
            }

            $(element).prepend(wrapper);
            rb.rIC(read);
        }),
    };

    /**
     * A jQuery plugin that invokes a callback as soon as the dimension of an element changes
     * @function external:"jQuery.fn".elementResize
     * @deprecated use rb_resize instead
     * @param action {String} "add" or "remove". Whether the function should be added or removed
     * @param fn {Function} The resize listener function that should be added or removed.
     * @param [options] {Object}
     * @param [options.noWidth=false] {Boolean} Only height changes to this element should fire the callback function.
     * @param [options.noHeight=false] {Boolean} Only width changes to this element should fire the callback function.
     * @returns {jQueryfiedObject}
     */
    $.fn.elementResize = function (action, fn, options) {
        if (action != 'remove') {
            action = 'add';
        }
        return this.each(function () {
            elementResize[action](this, fn, options);
        });
    };

    [['elemresize'], ['elemresizewidth', {noHeight: true}], ['elemresizeheight', {noWidth: true}]].forEach(function (evt) {
        rb.events.special[evt[0]] = {
            add: function (elem, fn) {
                elementResize.add(elem, fn, evt[1]);
            },
            remove: function (elem, fn) {
                elementResize.remove(elem, fn, evt[1]);
            },
        };
    });

    rb.logWarn('deprecated: use rb_resize instead.');

    return $.fn.elementResize;
}));
