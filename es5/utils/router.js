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

    var regSlashBegin = /^\//;
    var regSlashEnd = /\/$/;
    var regFullHash = /#(.*)$/;
    var regWildCard = /\*$/;

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

                if (routeObj.subRoutes && !path.endsWith('*')) {
                    path += '*';
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
                        params['*'] = path.slice(i).join('/');
                    }
                    break;
                } else if (routePart.type == 'placeholder') {
                    if (pathPart) {
                        params[routePart.name] = pathPart;
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
        applyRoutes: function applyRoutes(fragment) {

            var data = { fragment: fragment == null ? this.getFragment() : fragment };
            var fragmentParts = data.fragment.split('?');
            var options = (0, _deserialize2.default)(fragmentParts[1]);

            fragment = this.clearSlashes((fragmentParts[0] || '').replace(this.regIndex, ''));

            this.before = this.current;
            this.beforeRoute = this.currentRoute;
            this.beforeOptions = this.currentOptions || '';

            this.current = data.fragment;
            this.currentRoute = fragment;
            this.currentOptions = fragmentParts[1] || '';

            data.changedRoute = this.beforeRoute != this.currentRoute;
            data.changedOptions = this.beforeOptions != this.currentOptions;

            data.fragment = fragment;

            fragment = fragment.split('/');

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
        applyRoutesIfNeeded: function applyRoutesIfNeeded() {
            var cur = this.getFragment();

            if (this.current !== cur) {
                this.applyRoutes(cur);
            }

            return this;
        },
        listen: function listen() {
            this.current = this.getFragment();

            this.unlisten();

            if (!this._listener) {
                this._listener = this.applyRoutesIfNeeded.bind(this);
            }

            this.interval = setInterval(this._listener, 999);

            if (this.mode == 'hash') {
                window.addEventListener('hashchange', this._listener);
            } else {
                window.addEventListener('popstate', this._listener);
            }

            return this;
        },
        navigate: function navigate(path, replace) {
            path = path || '';

            if (this.mode === 'history') {
                window.history[replace === true ? 'replaceState' : 'pushState'](null, '', this.root + this.clearSlashes(path));
            } else {
                var value = window.location.href.replace(regFullHash, '') + '#' + path;

                if (replace === true) {
                    location.replace(value);
                } else {
                    window.location.href = value;
                }
            }

            this.applyRoutesIfNeeded();

            return this;
        },
        replace: function replace(path) {
            return this.navigate(path, true);
        }
    };

    exports.default = rb.Router;
});
