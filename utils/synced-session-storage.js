import storage from './storage';
import deferred from './deferred';

let promise;
let lastValue = false;
const GET_SYNCED_STORAGE = 'GET_SYNCED_SESSION';
const SYNCED_STORAGE_KEY = 'SYNCED_STORAGE_KEY';
const syncedSession = {};

function dispatchOwnSession(){
    const data = storage.session.get(SYNCED_STORAGE_KEY) || {};

    storage.local.set(SYNCED_STORAGE_KEY, data);
    setTimeout(() => {
        storage.local.remove(SYNCED_STORAGE_KEY);
    }, 0);
}

function storeOtherWindowsSession(newValue){
    if(lastValue !== newValue){
        lastValue = newValue;

        try {
            storage.session.set(SYNCED_STORAGE_KEY, JSON.parse(newValue || '{}'));
        } catch (e){
            //continue
        }

        setTimeout(() => {
            lastValue = false;
        }, 0);

    }
}

function tranferStorage({key, newValue}){
    if(!newValue){return;}

    if(key == GET_SYNCED_STORAGE){
        dispatchOwnSession();
    } else if(key == SYNCED_STORAGE_KEY){
        storeOtherWindowsSession(newValue);
    }
}

function initSyncedSession(){
    if(!promise){
        promise = deferred();
        window.addEventListener('storage', tranferStorage);
        storage.local.set(GET_SYNCED_STORAGE, true);

        setTimeout(() => {
            promise.resolve();
            storage.local.remove(GET_SYNCED_STORAGE);
        }, 9);
    }

    return promise;
}

syncedSession.set = function setSyncedSessionStorage(key, value){
    const data = storage.session.get(SYNCED_STORAGE_KEY) || {};

    data[key] = value;

    storage.session.set(SYNCED_STORAGE_KEY, data);
};

syncedSession.get = function getSyncedSessionStorage(key) {
    const data = storage.session.get(SYNCED_STORAGE_KEY) || {};

    return data[key];
};

syncedSession.remove = function removeSyncedSessionStorage(key) {
    const data = storage.session.get(SYNCED_STORAGE_KEY) || {};

    if(key in data){
        delete data[key];
        storage.session.set(SYNCED_STORAGE_KEY, data);
    }
};

syncedSession.init = initSyncedSession;
syncedSession.ready = initSyncedSession;

storage.syncedSession = syncedSession;

export default syncedSession;
