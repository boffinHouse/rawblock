/**
 * original by
 * http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url
 */

if (!window.rb) {
    window.rb = {};
}

import deserialize from './deserialize';
import getID from './get-id';

const rb = window.rb;

const regPlus = /\+/g;
const regSlashBegin = /^\//;
const regSlashEnd = /\/$/;
const regFullHash = /#(.*)$/;
const regWildCard = /\*$/;
const regReloadStop = /reload|stop/;
const winHistory = window.history;
let historyKeyCounter = 0;

const returnTrue = () => true;

function decodeParam(param){
    return decodeURIComponent(param.replace(regPlus, ' '));
}

rb.Router = {
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
    init({ options, listen } = {}) {
        this.config(options);
        this.initHistory();

        if(listen){
            this.listen();
        }
    },
    config: function (options) {
        options = options || {};

        this.mode = options.mode != 'hash' && ('pushState' in history) ?
            'history' :
            'hash';

        if (options.regHash) {
            this.regHash = options.regHash;
        }

        if (options.regIndex) {
            this.regIndex = options.regIndex;
        }

        this.root = options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';

        return this;
    },
    getFragment: function () {
        let match;
        let fragment = '';

        if (this.mode != 'hash') {
            fragment = decodeURI(location.pathname + location.search);
            fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
        } else {
            match = window.location.href.match(this.regHash);
            fragment = match ? match[1] : '';
        }

        return fragment;
    },
    clearSlashes(path) {
        return path.toString().replace(regSlashBegin, '').replace(regSlashEnd, '');
    },
    createRouteMatcher(routeObj, parentRoute = ''){
        let {path} = routeObj;
        const hasWildCard = regWildCard.test(path);

        path = this.clearSlashes(path);

        if(hasWildCard){
            path = path.replace(regWildCard, '');
        }

        if(parentRoute && !parentRoute.endsWith('/') && path){
            parentRoute += '/';
        }

        path = parentRoute + path;

        routeObj.path = path;

        routeObj.matcher = path ?
            path.split('/').map((name)=>{
                const isPlaceHolder = name[0] == ':';

                return {
                    type: isPlaceHolder ? 'placeholder' : 'strict',
                    name: isPlaceHolder ? name.slice(1) : name,
                };
            }) :
            []
        ;

        if(hasWildCard){
            routeObj.matcher.push({
                type: 'wildcard',
            });
        } else if(!routeObj.matcher.length){
            routeObj.matcher.push({
                type: 'strict',
                name: '',
            });
        }
    },

    extendRoutes(routes, parentPath){
        let path;

        for(path in routes){
            let routeObj = routes[path];

            if(typeof routeObj == 'function'){
                routeObj = {
                    handler: routeObj,
                };
                routes[path] = routeObj;
            }

            if(routeObj.subRoutes){
                if(!routeObj.handler){
                    routeObj.handler = returnTrue;
                }

                if(!path.endsWith('*')){
                    path += '*';
                }
            }

            routeObj.path = path;

            this.createRouteMatcher(routeObj, parentPath);

            if(routeObj.subRoutes){
                this.extendRoutes(routeObj.subRoutes, routeObj.path);
            }
        }
    },
    /**
     *
     * @param routes
     *
     * @example
     * Router.map({
     *      '/'(){
     *
     *      },
     *      '/:lang': {
     *          handler({lang}){
     *              return (lang in availableLangs);
     *          },
     *          subRoutes: {
     *              '/'(){
     *
     *              },
     *              '/user'
     *          }
     *      },
     *      '*'(){
     *
     *      }
     * });
     */
    map(routes){
        this.extendRoutes(routes);

        this.routes = routes;
    },
    flush() {
        this.routes = {};
        this.mode = null;
        this.root = '/';
        return this;
    },
    matches(route, path){
        const length = path.length + 1;

        if(route.length > length || ((length - 2) > route.length && route[route.length - 1].type != 'wildcard')){
            return null;
        }

        let params = {};

        for(let i = 0; i < length; i++){
            let routePart = route[i];
            let pathPart = path[i];

            if(!routePart){
                if(pathPart){
                    params = null;
                }
            } else if(routePart.type == 'wildcard'){
                if(pathPart){
                    params['*'] = decodeParam(path.slice(i).join('/'));
                }
                break;
            } else if(routePart.type == 'placeholder'){
                if(pathPart){
                    params[routePart.name] = decodeParam(pathPart);
                } else {
                    params = null;
                }
            } else if(routePart.name != pathPart) {
                params = null;
            }

            if(!params){
                break;
            }
        }

        return params;
    },
    findMatchingRoutes(routes, fragment, data, options){

        const noNavigate = this.noNavigate;

        this.noNavigate = true;

        for(let route in routes){
            route = routes[route];

            let handleResult;
            let params = this.matches(route.matcher, fragment);

            if (params) {
                handleResult = route.handler(params, options, data);

                if (handleResult == null) {
                    return null;
                } else if(handleResult === true){
                    if(route.subRoutes){
                        handleResult = this.findMatchingRoutes(route.subRoutes, fragment, data, options);

                        if(handleResult !== false){
                            return null;
                        }
                    }
                }
            }
        }

        this.noNavigate = noNavigate;

        return false;
    },
    _saveState(fragment, event = {type: 'unknown/initial'}){
        const data = {fragment: fragment == null ? this.getFragment() : fragment};
        const fragmentParts = data.fragment.split('?');

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
    applyRoutes(fragment, event) {

        const data = this._saveState(fragment, event);
        const options = deserialize(this.currentOptions);

        fragment = data.fragment.split('/');

        this.findMatchingRoutes(this.routes, fragment, data, options);

        return this;
    },
    unlisten() {
        if (this._listener) {
            window.removeEventListener('hashchange', this._listener);
            window.removeEventListener('popstate', this._listener);
        }
        if (this._listener || this.interval) {
            clearInterval(this.interval);
        }

        return this;
    },
    applyRoutesIfNeeded(){
        if(this.getFragment() !== this.current){
            this.onRouteChanged();
        }
    },
    onRouteChanged(event){
        const cur = this.getFragment();
        const stop = cur === this.current && regReloadStop.test(this.samePathStrategy);

        if(!stop){
            this.updateActiveHistoryIndex();
            this.applyRoutes(cur, event);
        } else if(event && event.original && event.original.type === 'popstate') {
            rb.logWarn('route did not change, but pop event occurred');
            this.updateActiveHistoryIndex();
        }

        return this;
    },
    initHistory: function(){
        const state = winHistory.state;
        let currentHistoryKey = state && state.historyKey;
        let restoredRouterState;
        this.history = null;

        try {
            restoredRouterState = JSON.parse(window.sessionStorage.getItem(this.storageKey));
        } catch(e) {} // eslint-disable-line no-empty

        if(restoredRouterState){
            this.sessionHistories = restoredRouterState.sessionHistories;

            if(currentHistoryKey && this.sessionHistories.length){
                this.history = this.sessionHistories.find((history) => {
                    const historyIndex = history.indexOf(currentHistoryKey);
                    if(historyIndex > -1){
                        this.activeHistoryIndex = historyIndex;
                        return true;
                    }
                });
            }
        }

        if(!currentHistoryKey){
            currentHistoryKey = this.getHistoryKey();
            winHistory.replaceState({
                state,
                historyKey: currentHistoryKey,
            }, '');
        }

        this.sessionHistories = this.sessionHistories || [];

        if(!this.history){
            this.history = [currentHistoryKey];
            this.activeHistoryIndex = 0;
            this.sessionHistories.push(this.history);
        }
    },
    updateActiveHistoryIndex(){
        const currentHistoryKey = winHistory.state && winHistory.state.historyKey;

        if(!currentHistoryKey){
            return rb.logWarn('missing currentHistoryKey');
        }

        this.activeHistoryIndex = this.history.indexOf(currentHistoryKey);

        if(this.activeHistoryIndex === -1){
            rb.logWarn('did not find key in history', currentHistoryKey, this.history, this.sessionHistories);
            this.history = [currentHistoryKey];
            this.activeHistoryIndex = 0;
            this.sessionHistories.push(this.history);
        }

        this.saveRouterState();
    },
    getHistoryKey(){
        historyKeyCounter += 1;
        return historyKeyCounter + '-' + getID();
    },
    addToHistory(historyKey, replace){
        if(replace){
            this.history[this.activeHistoryIndex] = historyKey;
        } else {
            // remove former history future stack
            const historyEndIndex = this.history.length - 1;
            if(historyEndIndex > this.activeHistoryIndex){
                this.history.length = this.activeHistoryIndex + 1;
            }

            this.history.push(historyKey);
            this.activeHistoryIndex = this.history.length - 1;
        }
        this.saveRouterState();
    },
    saveRouterState(){
        window.sessionStorage.setItem(this.storageKey, JSON.stringify({sessionHistories: this.sessionHistories}));
    },
    listen() {
        this.current = this.getFragment();

        this.unlisten();

        if (!this._listener) {
            //'interval' often means either browser bug or external (disapproved) pushState/replaceState call
            this._listener = (e = {type: 'interval'}) => {
                const run = e.type != 'interval' || this.getFragment() !== this.current;

                if(run){
                    this.onRouteChanged({
                        type: 'popstate',
                        original: {
                            type: e.type,
                            state: e.state,
                        },
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

    navigate(path, state = null, silent, replace) {

        // if(this.noNavigate){
        //     setTimeout(() => {
        //         this.navigate(...arguments);
        //     });
        //
        //     return this;
        // }

        path = path || '';

        const changedPath = this.getFragment() !== this.current;

        if(typeof state == 'boolean'){
            replace = silent;
            silent = state;
            state = null;
        }

        if(!changedPath){
            const { samePathStrategy } = this;

            if(samePathStrategy.includes('reload')){
                window.location.reload();
                return;
            } else if(samePathStrategy.includes('replace') && replace !== false){
                replace = true;
            }
        }

        const event = {
            type: 'navigate',
            replace,
        };

        if(!state || !state.historyKey || !state.state){
            state = {state, historyKey: this.getHistoryKey()};
        }

        this.addToHistory(state.historyKey, replace);

        if (this.mode === 'history') {
            winHistory[replace === true ? 'replaceState' : 'pushState'](state, '', this.root + this.clearSlashes(path));
        } else {
            const value = window.location.href.replace(regFullHash, '') + '#' + path;

            if(replace === true){
                location.replace(value);
            } else {
                window.location.href = value;
            }
        }

        if(silent){
            this._saveState(event);
        } else {
            this.onRouteChanged(event);
        }

        return this;
    },

    push(path, state, silent){
        return this.navigate(path, state, silent, false);
    },

    replace(path, state, silent) {
        return this.navigate(path, state, silent, true);
    },
};

export default rb.Router;
