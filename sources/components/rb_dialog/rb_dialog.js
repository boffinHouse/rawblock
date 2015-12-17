(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    var $ = rb.$;

    var Dialog = rb.Component.extend('dialog',
        /** @lends rb.components.dialog.prototype */
        {
            /**
             * @static
             * @property {Object} defaults
             * @property {Boolean} defaults.open=false Whether the dialog should be open by default
             * @property {Boolean} defaults.closeOnEsc=true Whether the dialog should be closed as soon as the user presses the ESC key.
             * @property {Boolean} defaults.closeOnBackdropClick=false Whether the dialog should be closed as soon as the user clicks on the backdrop.
             */
            defaults: {
                open: false,
                closeOnEsc: true,
                closeOnBackdropClick: false,
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

                this._setup = rb.rAF(this._setup, {that: this, throttle: true});
                this._open = rb.rAF(this._open, {throttle: true});
                this._close = rb.rAF(this._close, {throttle: true});

                if (this.options.open) {
                    this._setup();
                } else {
                    setTimeout(this._setup, 999 * Math.random());
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
                this.isReady = true;
                this.$element.before(this.$backdrop.get(0));
                this.$backdrop.append(this.$element.get(0));

                if (!this.element.getAttribute('tabindex')) {
                    this.element.setAttribute('tabindex', '-1');
                }
                if (!this.element.getAttribute('role')) {
                    this.element.setAttribute('role', 'dialog');
                }

                this._setUpEvents();

                if (this.options.open) {
                    this.open();
                }
            },
            _open: function (options) {
                this.$backdrop.addClass('is-open');

                this.setupOpenEvents();

                rb.$root.addClass('is-open-' + this.name +'-within');

                this.setComponentFocus(true);

                this._trigger(options);
            },
            /**
             * Opens the dialog
             * @param options {Object} options are passed to the change and changed event
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
                this._open(options);
                return true;
            },
            _close: function (options) {
                this.restoreFocus(true);

                this.$backdrop.removeClass('is-open');
                rb.$root.removeClass('is-open-' + this.name +'-within');
                this._trigger(options);
            },
            /**
             * Closes the dialog
             * @param options {Object} options are passed to the change and changed event
             * @returns {boolean}
             */
            close: function (options) {
                if (!this.isOpen || this._trigger(this._beforeEvtName, options).defaultPrevented) {
                    return false;
                }
                this.isOpen = false;

                this.teardownOpenEvents();

                this._close(options);
                return true;
            },

            /**
             * Toggles the dialog `isOpen` state.
             * @param options {Object} options are passed to the change and changed event
             * @returns {boolean}
             */
            toggle: function () {
                this[this.isOpen ? 'close' : 'open']();
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

    return Dialog;
}));
