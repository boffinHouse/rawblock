/**
 * original by
 * http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url
 */
if (!window.rb) {
    window.rb = {};
}
import deserialize from './deserialize';

const rb = window.rb;

const regPlus = /\+/g;
const regSlashBegin = /^\//;
const regSlashEnd = /\/$/;
const regFullHash = /#(.*)$/;
const regWildCard = /\*$/;
let currentIndex = 0;

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
    noNavigate: false,
    history: [],
    selectedIndex: -1,
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
    _saveState(fragment){
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

        return data;
    },
    applyRoutes(fragment, event = {type: 'unknown/initial'}) {

        const data = this._saveState(fragment);
        const options = deserialize(this.currentOptions);

        data.changedRoute = this.beforeRoute != this.currentRoute;
        data.changedOptions = this.beforeOptions != this.currentOptions;
        data.event = event;

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
    applyRoutesIfNeeded(event){
        const cur = this.getFragment();

        if (this.current !== cur) {
            this.applyRoutes(cur, event);
        }

        return this;
    },
    listen() {
        this.current = this.getFragment();

        this.unlisten();

        if (!this._listener) {
            //'interval' often means either browser bug or external (disapproved) pushState/replaceState call
            this._listener = (e = {type: 'interval'}) => {
                this.applyRoutesIfNeeded({
                    type: 'popstate',
                    original: {
                        type: e.type,
                        state: e.state,
                    },
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
    addToHistory(replace){
        const historyIndex = this.history.length - 1;

        if(replace){
            this.history[Math.max(this.selectedIndex, 0)] = currentIndex;
        } else {
            if(historyIndex > this.selectedIndex){
                this.history.length = this.selectedIndex + 1;
            }

            this.history.push(currentIndex);

            this.selectedIndex = this.history.length - 1;
        }

        window.sessionStorage.set('rawblock_router', JSON.stringify({history: this.history, selectedIndex: this.selectedIndex}));

    },
    navigate(path, state = null, silent, replace) {

        if(this.noNavigate){
            setTimeout(() => {
                this.navigate(...arguments);
            });

            return this;
        }

        path = path || '';

        if(typeof state == 'boolean'){
            replace = silent;
            silent = state;
            state = null;
        }

        this.addToHistory(replace);

        state = {state, currentIndex};

        if (this.mode === 'history') {
            window.history[replace === true ? 'replaceState' : 'pushState'](state, '', this.root + this.clearSlashes(path));
        } else {
            const value = window.location.href.replace(regFullHash, '') + '#' + path;

            if(replace === true){
                location.replace(value);
            } else {
                window.location.href = value;
            }
        }

        if(silent){
            this._saveState();
        } else {
            this.applyRoutesIfNeeded({
                type: 'navigate',
                replace,
            });
        }

        return this;
    },

    replace(path, state, silent) {
        return this.navigate(path, state, silent, true);
    },
};

export default rb.Router;
