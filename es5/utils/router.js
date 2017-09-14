(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './global-rb', './deserialize', './get-id', './add-log'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./global-rb'), require('./deserialize'), require('./get-id'), require('./add-log'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.globalRb, global.deserialize, global.getId, global.addLog);
        global.router = mod.exports;
    }
})(this, function (exports, _globalRb, _deserialize, _getId, _addLog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _globalRb2 = _interopRequireDefault(_globalRb);

    var _deserialize2 = _interopRequireDefault(_deserialize);

    var _getId2 = _interopRequireDefault(_getId);

    var _addLog2 = _interopRequireDefault(_addLog);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    /**
     * original by
     * http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url
     */

    var regPlus = /\+/g;
    var regSlashBegin = /^\//;
    var regSlashEnd = /\/$/;
    var regFullHash = /#(.*)$/;
    var regWildCard = /\*$/;
    var regReloadStop = /reload|stop/;

    var thenable = Promise.resolve();

    var winHistory = window.history;
    var historyKeyCounter = 0;

    var returnTrue = function returnTrue() {
        return true;
    };

    function decodeParam(param) {
        return decodeURIComponent(param.replace(regPlus, ' '));
    }

    _globalRb2.default.Router = (0, _addLog2.default)({
        routes: {},
        mode: 'history',
        root: '/',
        regHash: /#!(.*)$/,
        regIndex: /\/index\.htm[l]*$/,
        //reload reloads the page on Router.navigate, replace uses replaceState on Router.navigate and recalls the handler and recall simply re-calls the router handler
        samePathStrategy: 'replace', //reload, replace, recall, stop
        noNavigate: false,
        history: null,
        activeHistoryIndex: -1,
        storageKey: 'rb_router',
        init: function init() {
            var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                options = _ref.options,
                listen = _ref.listen;

            this.config(options);
            this.initHistory();

            if (listen) {
                this.listen();
            }
        },

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
            var event = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { type: 'unknown/initial' };

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

            data.changedRoute = this.beforeRoute != this.currentRoute;
            data.changedOptions = this.beforeOptions != this.currentOptions;
            data.history = this.history;
            data.activeHistoryIndex = this.activeHistoryIndex;
            data.event = event;

            return data;
        },
        applyRoutes: function applyRoutes(fragment, event) {

            var data = this._saveState(fragment, event);
            var options = (0, _deserialize2.default)(this.currentOptions);

            fragment = data.fragment.split('/');

            if (this.noNavigate) {
                this.logError('Router.applyRoutes called while routes are already applied.');
            }

            this.noNavigate = true;

            this.findMatchingRoutes(this.routes, fragment, data, options);

            this.noNavigate = false;

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
        applyRoutesIfNeeded: function applyRoutesIfNeeded(event) {
            if (this.getFragment() !== this.current) {
                this.onRouteChanged(event);
            }
        },
        onRouteChanged: function onRouteChanged(event) {
            var cur = this.getFragment();
            var stop = cur === this.current && regReloadStop.test(this.samePathStrategy);

            if (!stop) {
                this.updateActiveHistoryIndex();
                this.applyRoutes(cur, event);
            } else if (event && event.original && event.original.type === 'popstate') {
                this.logWarn('route did not change, but pop event occurred');
                this.updateActiveHistoryIndex();
            }

            return this;
        },

        initHistory: function initHistory() {
            var _this = this;

            var state = winHistory.state;
            var currentHistoryKey = state && state.historyKey;
            var restoredRouterState = void 0;
            this.history = null;

            try {
                restoredRouterState = JSON.parse(window.sessionStorage.getItem(this.storageKey));
            } catch (e) {} // eslint-disable-line no-empty

            if (restoredRouterState) {
                this.sessionHistories = restoredRouterState.sessionHistories;

                if (currentHistoryKey && this.sessionHistories.length) {
                    this.history = this.sessionHistories.find(function (history) {
                        var historyIndex = history.indexOf(currentHistoryKey);
                        if (historyIndex > -1) {
                            _this.activeHistoryIndex = historyIndex;
                            return true;
                        }
                    });
                }
            }

            if (!currentHistoryKey) {
                currentHistoryKey = this.getHistoryKey();
                winHistory.replaceState({
                    state: state,
                    historyKey: currentHistoryKey
                }, '');
            }

            this.sessionHistories = this.sessionHistories || [];

            if (!this.history) {
                this.history = [currentHistoryKey];
                this.activeHistoryIndex = 0;
                this.sessionHistories.push(this.history);
            }
        },
        updateActiveHistoryIndex: function updateActiveHistoryIndex() {
            var currentHistoryKey = winHistory.state && winHistory.state.historyKey;

            if (!currentHistoryKey) {
                return this.logWarn('missing currentHistoryKey');
            }

            this.activeHistoryIndex = this.history.indexOf(currentHistoryKey);

            if (this.activeHistoryIndex === -1) {
                this.logWarn('did not find key in history', currentHistoryKey, this.history, this.sessionHistories);
                this.history = [currentHistoryKey];
                this.activeHistoryIndex = 0;
                this.sessionHistories.push(this.history);
            }

            this.saveRouterState();
        },
        getHistoryKey: function getHistoryKey() {
            historyKeyCounter += 1;
            return historyKeyCounter + '-' + (0, _getId2.default)();
        },
        addToHistory: function addToHistory(historyKey, replace) {
            if (replace) {
                this.history[this.activeHistoryIndex] = historyKey;
            } else {
                // remove former history future stack
                var historyEndIndex = this.history.length - 1;
                if (historyEndIndex > this.activeHistoryIndex) {
                    this.history.length = this.activeHistoryIndex + 1;
                }

                this.history.push(historyKey);
                this.activeHistoryIndex = this.history.length - 1;
            }
            this.saveRouterState();
        },
        saveRouterState: function saveRouterState() {
            window.sessionStorage.setItem(this.storageKey, JSON.stringify({ sessionHistories: this.sessionHistories }));
        },
        listen: function listen() {
            var _this2 = this;

            this.current = this.getFragment();

            this.unlisten();

            if (!this._listener) {
                //'interval' often means either browser bug or external (disapproved) pushState/replaceState call
                this._listener = function () {
                    var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { type: 'interval' };

                    var run = e.type != 'interval' || _this2.getFragment() !== _this2.current;

                    if (run) {
                        _this2.onRouteChanged({
                            type: 'popstate',
                            original: {
                                type: e.type,
                                state: e.state
                            }
                        });
                    }
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

            var _this3 = this,
                _arguments = arguments;

            var silent = arguments[2];
            var replace = arguments[3];


            if (this.noNavigate) {
                thenable.then(function () {
                    _this3.navigate.apply(_this3, _arguments);
                });

                this.logWarn('Router.navigate called while routes are already applied.');
                return this;
            }

            path = path || '';

            var comparePath = this.root != '/' ? path.replace(this.root, '') : path;
            var changedPath = comparePath !== this.current;

            if (typeof state == 'boolean') {
                replace = silent;
                silent = state;
                state = null;
            }

            if (!changedPath) {
                var samePathStrategy = this.samePathStrategy;


                if (samePathStrategy.includes('reload')) {
                    window.location.reload();
                    return;
                } else if (samePathStrategy.includes('replace') && replace !== false) {
                    replace = true;
                }
            }

            var event = {
                type: 'navigate',
                replace: replace
            };

            if (!state || !state.historyKey || !state.state) {
                state = { state: state, historyKey: this.getHistoryKey() };
            }

            this.addToHistory(state.historyKey, replace);

            if (this.mode === 'history') {
                winHistory[replace === true ? 'replaceState' : 'pushState'](state, '', this.root + this.clearSlashes(path));
            } else {
                var value = window.location.href.replace(regFullHash, '') + '#' + path;

                if (replace === true) {
                    location.replace(value);
                } else {
                    window.location.href = value;
                }
            }

            if (silent) {
                this._saveState(event);
            } else {
                this.onRouteChanged(event);
            }

            return this;
        },
        push: function push(path, state, silent) {
            return this.navigate(path, state, silent, false);
        },
        replace: function replace(path, state, silent) {
            return this.navigate(path, state, silent, true);
        }
    }, 2);

    exports.default = _globalRb2.default.Router;
});
