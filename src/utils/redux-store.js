const data = {

};

export function getStoreNProvider() {
    return data;
}

export function setStoreNProvider(store, Provider) {
    if (store) {
        data.store = store;
    }

    if (Provider) {
        data.Provider = Provider;
    }
}
