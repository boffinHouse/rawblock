import { Component } from '../core';
/* eslint-disable no-unused-vars */
import React  from 'react';
import ReactDOM from 'react-dom';
import { getProviderStore } from './redux-store';
import throttle from './throttle';


export default function createRbReactIsland(name, ReactComponent, defaults = {}) {

    class ReactIslandComponent extends Component {

        static defaults = defaults;

        constructor() {
            super(...arguments);

            this.elemId = this.getId(true);
            this.providerStore = getProviderStore();

            this.render();

            this.render = throttle(this.render, {delay: 0});
        }

        setOption() {
            super.setOption(...arguments);

            this.render();
        }

        renderComponent(){
            const { options, elemId } = this;

            return (
                <ReactComponent
                    elemId={elemId}
                    options={Object.assign({}, options)}
                />
            );
        }

        async render() {
            const {Provider, store} = this.providerStore;

            await this.mutationPhase();

            ReactDOM.render(Provider && store ?
                (
                    <Provider store={store}>
                        {this.renderComponent()}
                    </Provider>
                ) :
                this.renderComponent(),
                this.element
            );
        }
    }

    return Component.register(name, ReactIslandComponent);
}
