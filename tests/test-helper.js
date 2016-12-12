(function () {
    'use strict';

    const size = {
        width: 300,
        height: 400,
    };

    const rbTest = {
        window: {
            _iframe: null,
            _resize: function (width, height) {
                if (!width) {
                    width = size.width;
                }
                if (!height) {
                    height = size.height;
                }
                this._iframe.style.width = width + 'px';
                this._iframe.style.height = height + 'px';
                return this;
            },
            resize: function () {
                this.promise.then( ()=> {
                    this._resize(...arguments);
                });
                return this.wait();
            },
            load: function (src) {
                const that = this;

                if (!this._iframe) {
                    this._iframe = document.createElement('iframe');
                    //this._iframe.style.position = 'absolute';
                    //this._iframe.style.top = '-99999999px';
                    //this._iframe.style.left = '-99999999px';
                    document.body.appendChild(this._iframe);
                }
                this._resize();

                this.promise = new Promise(function (resolve) {
                    const complete = function () {
                        that._iframe.removeEventListener('load', complete);
                        that._iframe.removeEventListener('error', complete);
                        that.win = that._iframe.contentWindow;
                        that.doc = that.win.document;

                        rbTest.wait(()=>{
                            resolve(that.win);
                        });
                    };
                    that._iframe.addEventListener('load', complete);
                    that._iframe.addEventListener('error', complete);
                    that._iframe.src = src;
                });


                return this;
            },

            wait: function (delay) {
                const that = this;
                const promise = rbTest.deferred();

                this.promise.then(function () {
                    rbTest.wait(delay).then(function(){
                        promise.resolve();
                    });
                    return promise;
                });
                that.promise = promise;
                return this;
            },
            then: function (fn) {
                this.promise.then(fn);
                return this;
            },
        },
        wait(cb, delay) {
            if (typeof cb == 'number') {
                delay = cb;
                cb = false;
            }

            const promise = new Promise(function (resolve) {
                const resolveIt = function () {
                    resolve();
                    if (cb) {
                        cb();
                    }
                };

                const afterFrame = function () {
                    requestAnimationFrame(function () {
                        setTimeout(resolveIt);
                    });
                };

                if (delay) {
                    setTimeout(afterFrame, delay);
                } else {
                    afterFrame();
                }
            });

            return promise;
        },
        deferred() {
            const tmp = {};
            const promise = new Promise((resolve, reject) => {
                tmp.resolve = resolve;
                tmp.reject = reject;
            });

            Object.assign(promise, tmp);

            return promise;
        },
    };


    window.rbTest = rbTest;
})();
