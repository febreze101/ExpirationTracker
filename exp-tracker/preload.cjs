const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script is running');

contextBridge.exposeInMainWorld('electron', {
    dbOps: {
        isFirstLaunch: () => {
            console.log('isFirstLaunch called');
            return ipcRenderer.invoke('db:isFirstLaunch');
        },
        isOnboardingComplete: () => {
            console.log('isOnboardingComplete called');
            return ipcRenderer.invoke('db:isOnboardingComplete');
        },
        addUser: (user) => {
            console.log('addUser called');
            return ipcRenderer.invoke('db:addUser', user);
        },
        getAllItems: () => {
            console.log('getAllItems called');
            return ipcRenderer.invoke('db:getAllItems');
        },
        getExpiredItems: () => {
            console.log('getExpiredItems called');
            return ipcRenderer.invoke('db:getExpiredItems');
        },
        getItemsExpiringSoon: (numDays) => {
            console.log('getItemsExpiringSoon called with numDays:', numDays);
            return ipcRenderer.invoke('db:getItemsExpiringSoon', numDays);
        },
        addItems: (items) => {
            console.log('addItems called with:', items);
            return ipcRenderer.invoke('db:addItems', items);
        },
        addItem: (itemName) => {
            console.log('addItem called with:', itemName);
            return ipcRenderer.invoke('db:addItem', itemName);
        },
        updateExpirationDate: (itemName, date) => {
            console.log('updateExpirationDate called:', { itemName, date });
            return ipcRenderer.invoke('db:updateExpirationDate', itemName, date);
        },

        clearInventory: () => {
            console.log('clearInventory called');
            return ipcRenderer.invoke('db:clearInventory');
        },
        deleteItem: (item) => {
            console.log('deleteItem called:', { item });
            return ipcRenderer.invoke('db:deleteItem', item);
        },

        printDatabase: () => ipcRenderer.invoke('db:printDatabase'),
        moveExpiredItems: () => {
            console.log('moveExpiredItems called');
            return ipcRenderer.invoke('db:moveExpiredItems');
        },
        restoreExpiredItem: (itemName) => {
            console.log('restoreExpiredItem called:', { itemName });
            return ipcRenderer.invoke('db:restoreExpiredItem', itemName);
        },
        getExpirationDetails: (item) => {
            console.log('getExpirationDetails called:', { item });
            return ipcRenderer.invoke('db:getExpirationDetails', item);
        },
        setAsExpired: (item) => {
            console.log('setAsExpired called:', { item });
            return ipcRenderer.invoke('db:setAsExpired', item);
        },
        getItemsWithExpiration: () => {
            console.log('getItemsWithExpiration called:');
            return ipcRenderer.invoke('db:getItemsWithExpiration',);
        },
        removeFromInventory: (itemName) => {
            console.log('removeFromInventory called:', { item: itemName });
            return ipcRenderer.invoke('db:removeFromInventory', itemName);
        },

        window: {
            minimize: () => ipcRenderer.invoke('window:minimize'),
            hide: () => ipcRenderer.invoke('window:hide'),
        }
    }

});

console.log('Preload script finished loading');
