(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './storage', './deferred'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./storage'), require('./deferred'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.storage, global.deferred);
        global.syncedSessionStorage = mod.exports;
    }
})(this, function (exports, _storage, _deferred) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _storage2 = _interopRequireDefault(_storage);

    var _deferred2 = _interopRequireDefault(_deferred);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var promise = void 0;
    var lastValue = false;
    var GET_SYNCED_STORAGE = 'GET_SYNCED_SESSION';
    var SYNCED_STORAGE_KEY = 'SYNCED_STORAGE_KEY';
    var syncedSession = {};

    function dispatchOwnSession() {
        var data = _storage2.default.session.get(SYNCED_STORAGE_KEY) || {};

        _storage2.default.local.set(SYNCED_STORAGE_KEY, data);
        setTimeout(function () {
            _storage2.default.local.remove(SYNCED_STORAGE_KEY);
        }, 0);
    }

    function storeOtherWindowsSession(newValue) {
        if (lastValue !== newValue) {
            lastValue = newValue;

            try {
                _storage2.default.session.set(SYNCED_STORAGE_KEY, JSON.parse(newValue || '{}'));
            } catch (e) {
                //continue
            }

            setTimeout(function () {
                lastValue = false;
            }, 0);
        }
    }

    function tranferStorage(_ref) {
        var key = _ref.key,
            newValue = _ref.newValue;

        if (!newValue) {
            return;
        }

        if (key == GET_SYNCED_STORAGE) {
            dispatchOwnSession();
        } else if (key == SYNCED_STORAGE_KEY) {
            storeOtherWindowsSession(newValue);
        }
    }

    function initSyncedSession() {
        if (!promise) {
            promise = (0, _deferred2.default)();
            window.addEventListener('storage', tranferStorage);
            _storage2.default.local.set(GET_SYNCED_STORAGE, true);

            setTimeout(function () {
                _storage2.default.local.remove(GET_SYNCED_STORAGE, true);
                promise.resolve();
            }, 9);
        }

        return promise;
    }

    syncedSession.set = function setSyncedSessionStorage(key, value) {
        var data = _storage2.default.session.get(SYNCED_STORAGE_KEY) || {};

        data[key] = value;

        _storage2.default.session.set(SYNCED_STORAGE_KEY, data);
    };

    syncedSession.get = function getSyncedSessionStorage(key) {
        var data = _storage2.default.session.get(SYNCED_STORAGE_KEY) || {};

        return data[key];
    };

    syncedSession.remove = function removeSyncedSessionStorage(key) {
        var data = _storage2.default.session.get(SYNCED_STORAGE_KEY) || {};

        if (key in data) {
            delete data[key];
            _storage2.default.session.set(SYNCED_STORAGE_KEY, data);
        }
    };

    syncedSession.init = initSyncedSession;
    syncedSession.ready = initSyncedSession;

    _storage2.default.syncedSession = syncedSession;

    exports.default = syncedSession;
});
