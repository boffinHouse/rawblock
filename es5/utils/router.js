(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './deserialize'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./deserialize'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.deserialize);
        global.router = mod.exports;
    }
})(this, function (exports, _deserialize) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _deserialize2 = _interopRequireDefault(_deserialize);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    /**
     * original by
     * http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url
     */
    if (!window.rb) {
        window.rb = {};
    }


    var rb = window.rb;

    var regPlus = /\+/g;
    var regSlashBegin = /^\//;
    var regSlashEnd = /\/$/;
    var regFullHash = /#(.*)$/;
    var regWildCard = /\*$/;

    var returnTrue = function returnTrue() {
        return true;
    };

    function decodeParam(param) {
        return decodeURIComponent(param.replace(regPlus, ' '));
    }

    rb.Router = {
        routes: {},
        mode: 'history',
        root: '/',
        regHash: /#!(.*)$/,
        regIndex: /\/index\.htm[l]*$/,
        config: function config(options) {
            options = options || {};

            this.mode = options.mode != 'hash' && 'pushState' in history ? 'history' : 'hash';

            if (options.regHash) {
                this.regHash = options.regHash;
            }

            if (options.regIndex) {
                this.regIndex = options.regIndex;
            }

            this.root = options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
            return this;
        },
        getFragment: function getFragment() {
            var match = void 0;
            var fragment = '';

            if (this.mode != 'hash') {
                fragment = decodeURI(location.pathname + location.search);
                fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
            } else {
                match = window.location.href.match(this.regHash);
                fragment = match ? match[1] : '';
            }

            return fragment;
        },
        clearSlashes: function clearSlashes(path) {
            return path.toString().replace(regSlashBegin, '').replace(regSlashEnd, '');
        },
        createRouteMatcher: function createRouteMatcher(routeObj) {
            var parentRoute = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
            var path = routeObj.path;

            var hasWildCard = regWildCard.test(path);

            path = this.clearSlashes(path);

            if (hasWildCard) {
                path = path.replace(regWildCard, '');
            }

            if (parentRoute && !parentRoute.endsWith('/') && path) {
                parentRoute += '/';
            }

            path = parentRoute + path;

            routeObj.path = path;

            routeObj.matcher = path ? path.split('/').map(function (name) {
                var isPlaceHolder = name[0] == ':';

                return {
                    type: isPlaceHolder ? 'placeholder' : 'strict',
                    name: isPlaceHolder ? name.slice(1) : name
                };
            }) : [];

            if (hasWildCard) {
                routeObj.matcher.push({
                    type: 'wildcard'
                });
            } else if (!routeObj.matcher.length) {
                routeObj.matcher.push({
                    type: 'strict',
                    name: ''
                });
            }
        },
        extendRoutes: function extendRoutes(routes, parentPath) {
            var path = void 0;

            for (path in routes) {
                var routeObj = routes[path];

                if (typeof routeObj == 'function') {
                    routeObj = {
                        handler: routeObj
                    };
                    routes[path] = routeObj;
                }

                if (routeObj.subRoutes) {
                    if (!routeObj.handler) {
                        routeObj.handler = returnTrue;
                    }

                    if (!path.endsWith('*')) {
                        path += '*';
                    }
                }

                routeObj.path = path;

                this.createRouteMatcher(routeObj, parentPath);

                if (routeObj.subRoutes) {
                    this.extendRoutes(routeObj.subRoutes, routeObj.path);
                }
            }
        },
        map: function map(routes) {
            this.extendRoutes(routes);

            this.routes = routes;
        },
        flush: function flush() {
            this.routes = {};
            this.mode = null;
            this.root = '/';
            return this;
        },
        matches: function matches(route, path) {
            var length = path.length + 1;

            if (route.length > length || length - 2 > route.length && route[route.length - 1].type != 'wildcard') {
                return null;
            }

            var params = {};

            for (var i = 0; i < length; i++) {
                var routePart = route[i];
                var pathPart = path[i];

                if (!routePart) {
                    if (pathPart) {
                        params = null;
                    }
                } else if (routePart.type == 'wildcard') {
                    if (pathPart) {
                        params['*'] = decodeParam(path.slice(i).join('/'));
                    }
                    break;
                } else if (routePart.type == 'placeholder') {
                    if (pathPart) {
                        params[routePart.name] = decodeParam(pathPart);
                    } else {
                        params = null;
                    }
                } else if (routePart.name != pathPart) {
                    params = null;
                }

                if (!params) {
                    break;
                }
            }

            return params;
        },
        findMatchingRoutes: function findMatchingRoutes(routes, fragment, data, options) {

            for (var route in routes) {
                route = routes[route];

                var handleResult = void 0;
                var params = this.matches(route.matcher, fragment);

                if (params) {
                    handleResult = route.handler(params, options, data);

                    if (handleResult == null) {
                        return null;
                    } else if (handleResult === true) {
                        if (route.subRoutes) {
                            handleResult = this.findMatchingRoutes(route.subRoutes, fragment, data, options);

                            if (handleResult !== false) {
                                return null;
                            }
                        }
                    }
                }
            }

            return false;
        },
        _saveState: function _saveState(fragment) {
            var data = { fragment: fragment == null ? this.getFragment() : fragment };
            var fragmentParts = data.fragment.split('?');

            fragment = this.clearSlashes((fragmentParts[0] || '').replace(this.regIndex, ''));

            this.before = this.current;
            this.beforeRoute = this.currentRoute;
            this.beforeOptions = this.currentOptions || '';

            this.current = data.fragment;
            this.currentRoute = fragment;
            this.currentOptions = fragmentParts[1] || '';

            data.fragment = fragment;

            return data;
        },
        applyRoutes: function applyRoutes(fragment) {
            var caller = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { type: 'unknown/initial' };


            var data = this._saveState(fragment);
            var options = (0, _deserialize2.default)(this.currentOptions);

            data.changedRoute = this.beforeRoute != this.currentRoute;
            data.changedOptions = this.beforeOptions != this.currentOptions;
            data.caller = caller;

            fragment = data.fragment.split('/');

            this.findMatchingRoutes(this.routes, fragment, data, options);

            return this;
        },
        unlisten: function unlisten() {
            if (this._listener) {
                window.removeEventListener('hashchange', this._listener);
                window.removeEventListener('popstate', this._listener);
            }
            if (this._listener || this.interval) {
                clearInterval(this.interval);
            }

            return this;
        },
        applyRoutesIfNeeded: function applyRoutesIfNeeded(caller) {
            var cur = this.getFragment();

            if (this.current !== cur) {
                this.applyRoutes(cur, caller);
            }

            return this;
        },
        listen: function listen() {
            var _this = this;

            this.current = this.getFragment();

            this.unlisten();

            if (!this._listener) {
                //'interval' often means either browser bug or external (disapproved) pushState/replaceState call
                this._listener = function () {
                    var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { type: 'interval' };

                    _this.applyRoutesIfNeeded({
                        type: 'popstate',
                        original: {
                            type: e.type,
                            state: e.state
                        }
                    });
                };
            }

            this.interval = setInterval(this._listener, 999);

            if (this.mode == 'hash') {
                window.addEventListener('hashchange', this._listener);
            } else {
                window.addEventListener('popstate', this._listener);
            }

            return this;
        },
        navigate: function navigate(path) {
            var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var silent = arguments[2];
            var replace = arguments[3];

            path = path || '';

            if (typeof state == 'boolean') {
                replace = silent;
                silent = state;
                state = null;
            }

            if (this.mode === 'history') {
                window.history[replace === true ? 'replaceState' : 'pushState'](state, '', this.root + this.clearSlashes(path));
            } else {
                var value = window.location.href.replace(regFullHash, '') + '#' + path;

                if (replace === true) {
                    location.replace(value);
                } else {
                    window.location.href = value;
                }
            }

            if (silent) {
                this._saveState();
            } else {
                this.applyRoutesIfNeeded({
                    type: 'navigate',
                    replace: replace
                });
            }

            return this;
        },
        replace: function replace(path, state, silent) {
            return this.navigate(path, state, silent, true);
        }
    };

    exports.default = rb.Router;
});
