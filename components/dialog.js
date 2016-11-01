(function (factory) {
    if (typeof module === 'object' && module.exports) {
        require('../utils/rb_scrollbarwidth');
        //optional dependency
        //require('../utils/rb_fetch');
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    var rb = window.rb;
    var $ = rb.$;
    var regInputs = /^(?:input|textarea)$/i;

    var Dialog = rb.Component.extend('dialog',
        /** @lends rb.components.dialog.prototype */
        {
            /**
             * @static
             * @property {Object} defaults
             * @property {Boolean} defaults.open=false Whether the dialog should be open by default
             * @property {Boolean} defaults.appendToBody=true
             * @property {Boolean} defaults.closeOnEsc=true Whether the dialog should be closed as soon as the user presses the ESC key.
             * @property {Boolean} defaults.closeOnBackdropClick=true Whether the dialog should be closed as soon as the user clicks on the backdrop.
             * @property {String} defaults.contentId=''
             * @property {String} defaults.backdropClass=''
             * @property {Boolean} defaults.setDisplay=true
             * @property {String|Boolean} defaults.scrollPadding='paddingRight' Whether to set a paddingRight/paddingLeft value to the body.
             * @property {Boolean|String} defaults.setFocus='force' Whether the component should set the focus on open. true: sets only focus if js-rb-autofocus is found. 'force': sets focus to dialog, if no 'js-rb-autofocus' was found.
             */
            defaults: {
                open: false,
                closeOnEsc: true,
                closeOnBackdropClick: true,
                appendToBody: true,
                contentId: '',
                backdropClass: '',
                setDisplay: true,
                scrollPadding: 'paddingRight',
                trapKeyboard: true,
                setFocus: 'force',
            },
            /**
             * @constructs
             * @classdesc Class component to create a modal dialog with a backdrop.
             * @name rb.components.dialog
             * @extends rb.Component
             * @param element {Element}
             *
             * @fires dialog#change Fires before a dialog's `isOpen` state changes; The default behavior can be prevented.
             * @fires dialog#changed Fires after a dialog's `isOpen` state changed;
             *
             * @example
             * <button aria-controls="dialog-1" data-module="button" type="button" class="js-rb-click">button</button>
             * <div id="dialog-1" class="rb-dialog" data-module="dialog">
             *     <div class="dialog-content">
             *      {{dialogContent}}
             *    </div>
             *    <button type="button" class="dialog-close">close</button>
             * </div>
             * @example
             * rb.$('.rb-dialog').rbComponent().open();
             * rb.$('.rb-dialog').on('dialogchanged', function(){
			 *      console.log(rb.$(this).rbComponent().isOpen);
			 * });
             */
            init: function (element, initialDefaults) {

                this._super(element, initialDefaults);

                /**
                 * @name rb.components.dialog.prototype.isOpen
                 * @type {boolean}
                 */
                this.isOpen = false;

                this.$backdrop = $(document.createElement('div')).addClass(this.name + rb.elementSeparator + 'backdrop');


                this.contentElement = this.query('.{name}{e}content');

                rb.rAFs(this, {that: this, throttle: true}, '_setup', '_addContent', '_setDisplay');

                rb.rAFs(this, {throttle: true}, '_open', '_close');

                if (this.options.open) {
                    this._setup();
                } else {
                    setTimeout(this._setup, 99 + (999 * Math.random()));
                }
            },
            events: {
                'click:closest(.{name}{e}close)': function (e) {
                    this.close();
                    e.preventDefault();
                    e.stopPropagation();
                }
            },
            _setup: function () {
                if (this.isReady || !this.element.parentNode) {
                    return;
                }
                var backdrop, isWrapped;
                var backdropDocument = this.element.parentNode;
                var backdropDocumentName = this.name + rb.elementSeparator + 'backdrop' + rb.nameSeparator + 'document';

                this.trapKeyboardElemBefore = $(document.createElement('span')).attr({
                    'class': this.name + 'keyboardtrap',
                    'tabindex': this.options.trapKeyboard ? 0 : -1,
                }).get(0);

                this.trapKeyboardElemAfter = this.trapKeyboardElemBefore.cloneNode();

                this.isReady = true;

                if(!backdropDocument || !backdropDocument.classList.contains(backdropDocumentName)){
                    backdropDocument = document.createElement('div');
                    backdropDocument.className = backdropDocumentName;
                    this.$backdrop.append(backdropDocument);
                } else if(backdropDocument && (backdrop = backdropDocument.parentNode) && backdrop.classList.contains(this.name + rb.elementSeparator + 'backdrop')) {
                    this.$backdrop = $(backdrop);
                    isWrapped = true;
                }

                this.backdropDocument = backdropDocument;

                $(this.backdropDocument).before(this.trapKeyboardElemBefore).after(this.trapKeyboardElemAfter);

                if(this.options.backdropClass){
                    this.$backdrop.addClass(this.options.backdropClass);
                }

                if(this.options.appendToBody){
                    document.body.appendChild(this.$backdrop.get(0));
                } else if(!isWrapped) {
                    this.$element.before(this.$backdrop.get(0));
                }

                if(!isWrapped){
                    backdropDocument.appendChild(this.element);
                }

                if (!this.element.getAttribute('tabindex')) {
                    this.element.setAttribute('tabindex', '-1');
                }
                if (!this.element.getAttribute('role')) {
                    this.element.setAttribute('role', 'group');
                }

                this._setUpEvents();

                if (this.options.open) {
                    this.open();
                } else if(this.options.setDisplay){
                    this.$backdrop.css({display: 'none'});
                }
            },
            _open: function (options) {
                var content;

                if(this.contentElement && options && options.contentId && this._curContentId != options.contentId && (content = document.getElementById(options.contentId))){
                    this._curContentId = options.contentId;
                    this.contentElement.innerHTML = content.innerHTML;
                }

                if(this._xhr){
                    this.contentElement.innerHTML = '';
                    this.$backdrop.addClass(rb.statePrefix + 'loading');
                }

                this.$backdrop.css({display: ''});
                this.$backdrop.addClass(rb.statePrefix + 'open');

                rb.$root.rbChangeState('open{-}' + this.name +'{-}within', true);

                if(this._setScrollPadding && this.options.scrollPadding){
                    document.body.style[this.options.scrollPadding] = this._setScrollPadding + 'px';
                }

                if(options.focusElement){
                    this.setComponentFocus(options.focusElement);
                } else {
                    this.storeActiveElement();
                }

                this._trigger(options);
            },
            /**
             * Opens the dialog
             * @param [options] {Object} options are passed to the change and changed event
             * @returns {boolean}
             */
            open: function (options) {
                var scrollbarWidth;

                var mainOpts = this.options;

                if (this.isOpen || this._trigger(this._beforeEvtName, options).defaultPrevented) {
                    return false;
                }
                if (!this.isReady) {
                    this._setup();
                }

                this.isOpen = true;

                if(!options){
                    options = {};
                }

                if(typeof options.focusElement != 'object' && (options.focusElement || mainOpts.setFocus)){
                    options.focusElement = this.getFocusElement(options.focusElement || mainOpts.setFocus == 'force');
                }

                if(options.contentUrl){
                    this._xhr = rb.fetch({url: options.contentUrl}).then(this._addContent);
                }

                if(this.options.setDisplay && this._displayTimer){
                    clearTimeout(this._displayTimer);
                    this._displayTimer = null;
                }

                this._setScrollPadding = this.options.scrollPadding && rb.root.clientHeight + 1 < rb.root.scrollHeight &&
                    (scrollbarWidth = rb.scrollbarWidth) &&
                        parseFloat(rb.getStyles(document.body)[this.options.scrollPadding]) + scrollbarWidth
                ;

                if(this._setScrollPadding){
                    this._oldPaddingValue = document.body.style[this.options.scrollPadding];
                }

                if(!this.options.setDisplay && options.focusElement && regInputs.test(options.focusElement.nodeName)){
                    this._open._rbUnrafedFn.call(this, options);
                } else {
                    this._open(options);
                }
                return true;
            },
            _close: function (options) {
                this.restoreFocus(true);

                if(this._setScrollPadding && this._oldPaddingValue != null){
                    document.body.style[this.options.scrollPadding] = this._oldPaddingValue;
                    this._setScrollPadding = 0;
                    this._oldPaddingValue = null;
                }

                this.$backdrop.removeClass(rb.statePrefix + 'open');
                rb.$root.rbChangeState('open{-}' + this.name +'{-}within');

                if(this.options.setDisplay){
                    clearTimeout(this._displayTimer);
                    this._displayTimer = setTimeout(this._setDisplay, 5000);
                }
                this._trigger(options);
            },
            /**
             * Closes the dialog
             * @param [options] {Object} options are passed to the change and changed event
             * @returns {boolean}
             */
            close: function (options) {
                if (!this.isOpen || this._trigger(this._beforeEvtName, options).defaultPrevented) {
                    return false;
                }
                this.isOpen = false;
                this._xhr = null;

                this._close(options);
                return true;
            },

            /**
             * Toggles the dialog `isOpen` state.
             * @param [options] {Object} options are passed to the change and changed event
             * @returns {boolean}
             */
            toggle: function (options) {
                this[this.isOpen ? 'close' : 'open'](options);
            },
            _addContent: function(data){
                if(this._xhr && this.contentElement){
                    this.contentElement.innerHTML = data.data;
                }
                this.$backdrop.removeClass(rb.statePrefix + 'loading');
                this._xhr = null;
            },
            _setDisplay: function(){
                this.$backdrop.css({display: this.isOpen ? '' : 'none'});
                this._displayTimer = null;
            },

            _setUpEvents: function () {
                var that = this;
                var options = this.options;

                this.$backdrop
                    .on('click', function (e) {
                        if (options.closeOnBackdropClick && (e.target == e.currentTarget || e.target == that.backdropDocument)) {
                            that.close();
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    })
                ;
                this.$backdrop.on('keydown', function (e) {
                    if (e.keyCode == 27 && options.closeOnEsc && !e.defaultPrevented) {
                        that.close();
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });

                this.trapKeyboardElemBefore.addEventListener('focus', function(e){
                    var focusElem;
                    if(options.trapKeyboard) {
                        focusElem = that.queryAll('.{name}{e}close');
                        e.preventDefault();
                        try {
                            focusElem[focusElem.length - 1].focus();
                        } catch (er) { }
                    }
                }, true);

                this.trapKeyboardElemAfter.addEventListener('focus', function(e){
                    if(options.trapKeyboard){
                        e.preventDefault();
                        try {
                            that.element.focus();
                        } catch (er){}
                    }
                }, true);
            },
        }
    );

    rb.ready.then(function(){
        rb.click.add('dialog', function(element, event, attr){
            var dialog;
            var opts = rb.jsonParse(attr);

            if(typeof opts == 'string'){
                opts = {id: opts};
            }
            dialog = document.getElementById(opts.id);

            if(dialog && (dialog = rb.getComponent(dialog))){
                dialog.open(opts);
                event.preventDefault();
            }
        });
    });

    return Dialog;
}));
