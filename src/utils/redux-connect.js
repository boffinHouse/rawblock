import { getStoreNProvider } from './redux-store';
import throttle from './throttle';
import Symbol from './symbol';

export const reduxUnsubscribe = Symbol('reduxUnsubscribe');
export const handleReduxState = Symbol('handleReduxState');
export const installReduxSubscriber = Symbol('installReduxSubscriber');

export function reduxConnect(stateMapper, dispatchMap = null) {
    const store = getStoreNProvider().store;

    return (esClass) => {

        Object.assign(esClass.prototype, {
            setupRedux() {
                this.reduxstore = store;
                this.dispatchers = {};
                this.reduxState = {};

                Object.entries(dispatchMap).forEach(([name, actionCreators]) => {
                    this.dispatchers[name] = function() {
                        return store.dispatch(actionCreators(...arguments));
                    };
                });

                if (stateMapper) {
                    let silent = true;
                    const onReduxStateChange = () => {
                        const previousState = this.reduxState;
                        const currentState = stateMapper(store.getState());

                        this.reduxState = currentState;

                        if (silent || !this.onReduxChange) {return;}

                        let hasChanges = false;
                        const changes = Object.entries(currentState).reduce((accChanges, [name, currentValue]) => {
                            if (previousState && previousState[name] !== currentValue) {
                                accChanges[name] = {
                                    currentValue,
                                    previousValue: previousState[name],
                                };
                                hasChanges = true;
                            }

                            return accChanges;
                        }, {});

                        if (hasChanges) {
                            this.onReduxChange(changes);
                        }
                    };

                    this[handleReduxState] = throttle(onReduxStateChange, {delay: 0, micro: true});

                    this[installReduxSubscriber] = () => {
                        if (!this[reduxUnsubscribe]) {
                            this[reduxUnsubscribe] = getStoreNProvider().store.subscribe(() => {
                                this[handleReduxState]();
                            });
                        }
                    };

                    this[installReduxSubscriber]();

                    onReduxStateChange();

                    silent = false;
                }
            },
        });

        if (stateMapper) {
            const {attached, detached} = esClass.prototype;

            Object.assign(esClass.prototype, {
                attached(){
                    const ret = attached && attached.apply(this, arguments);

                    this[installReduxSubscriber]();

                    return ret;
                },
                detached(){
                    const ret = detached && detached.apply(this, arguments);

                    if (this[reduxUnsubscribe]) {
                        this[reduxUnsubscribe]();
                        delete this[reduxUnsubscribe];
                    }

                    return ret;
                },
            });
        }

        return esClass;
    };
}
