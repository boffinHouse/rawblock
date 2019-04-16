const data = {

};

export function getProviderStore() {
    return data;
}

export function setProviderStore(Provider, store) {
    data.Provider = Provider;
    data.store = store;
}
