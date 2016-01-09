(function (factory) {
    if (typeof module === 'object' && module.exports) {
        //optional dependency
        //require('../../js/utils/rb_fetch');
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
             * @property {Boolean} defaults.closeOnBackdropClick=false Whether the dialog should be closed as soon as the user clicks on the backdrop.
             * @property {String} defaults.contentId=''
             * @property {String} defaults.backdropClass=''
             */
            defaults: {
                open: false,
                closeOnEsc: true,
                closeOnBackdropClick: false,
                appendToBody: true,
                contentId: '',
                backdropClass: '',
                setDisplay: true,
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
             * <button aria-controls="dialog-1" data-module="button" type="button" class="js-click">button</button>
             * <div id="dialog-1" data-module="dialog">
             *    {{dialogContent}}
             *    <button type="button" class="dialog-close">close</button>
             * </div>
             * @example
             * rb.$('.rb-dialog').rbComponent().open();
             * rb.$('.rb-dialog').on('dialogchanged', function(){
			 *      console.log(rb.$(this).rbComponent().isOpen);
			 * });
             */
            init: function (element) {

                this._super(element);

                /**
                 * @name rb.components.dialog.prototype.isOpen
                 * @type {boolean}
                 */
                this.isOpen = false;

                this.$backdrop = $(document.createElement('div')).addClass(this.name + '-backdrop');


                this.contentElement = this.query('.{name}-content');

                rb.rAFs(this, {that: this, throttle: true}, '_setup', '_addContent', '_setDisplay');

                rb.rAFs(this, {throttle: true}, '_open', '_close');

                if (this.options.open) {
                    this._setup();
                } else {
                    setTimeout(this._setup, 99 + (999 * Math.random()));
                }
            },
            events: {
                'click .{name}-close': function (e) {
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
                var backdropDocumentName = this.name + '-backdrop-document';

                this.isReady = true;

                if(!backdropDocument || !backdropDocument.classList.contains(backdropDocumentName)){
                    backdropDocument = document.createElement('div');
                    backdropDocument.className = backdropDocumentName;
                    this.$backdrop.append(backdropDocument);
                } else if(backdropDocument && (backdrop = backdropDocument.parentNode) && backdrop.classList.contains(this.name + '-backdrop')) {
                    this.$backdrop = $(backdrop);
                    isWrapped = true;
                }

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
                    this.element.setAttribute('role', 'dialog');
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

                this.$backdrop.addClass(rb.statePrefix + 'open');

                this.setupOpenEvents();

                rb.$root.addClass(rb.statePrefix + 'open-' + this.name +'-within');

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

                if(!options.focusElement){
                    options.focusElement = this.getFocusElement(true);
                }

                if(options.contentUrl){
                    this._xhr = rb.fetch({url: options.contentUrl}).then(this._addContent);
                }

                if(this.options.setDisplay){
                    this.$backdrop.css({display: 'block'});
                    if(this._displayTimer){
                        clearTimeout(this._displayTimer);
                        this._displayTimer = null;
                    }
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

                this.$backdrop.removeClass(rb.statePrefix + 'open');
                rb.$root.removeClass(rb.statePrefix + 'open-' + this.name +'-within');

                if(this.options.setDisplay){
                    clearTimeout(this._displayTimer);
                    this._displayTimer = setTimeout(this._setDisplay, 2000);
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

                this.teardownOpenEvents();

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
                this.$backdrop.css({display: this.isOpen ? 'block' : 'none'});
                this._displayTimer = null;
            },
            setupOpenEvents: function () {
                var that = this;
                if (!this.closeOnEsc) {
                    this.closeOnEsc = function (e) {
                        if (e.keyCode == 27 && that.options.closeOnEsc && !e.defaultPrevented) {
                            that.close();
                        }
                    };
                }

                $(document).on('keydown', this.closeOnEsc);
            },

            teardownOpenEvents: function () {
                if (this.closeOnEsc) {
                    $(document).off('keydown', this.closeOnEsc);
                }
            },

            _setUpEvents: function () {
                var that = this;

                this.$backdrop
                    .on('click', function (e) {
                        if (that.options.closeOnBackdropClick && e.target == e.currentTarget) {
                            that.close();
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    })
                ;
            },
        }
    );

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

    return Dialog;
}));
