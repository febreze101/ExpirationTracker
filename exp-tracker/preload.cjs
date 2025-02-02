const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script is running');

contextBridge.exposeInMainWorld('electron', {
    dbOps: {
        getAllItems: () => {
            console.log('getAllItems called');
            return ipcRenderer.invoke('db:getAllItems');
        },
        getExpiredItems: () => {
            console.log('getExpiredItems called');
            return ipcRenderer.invoke('db:getExpiredItems');
        },
        addItems: (items) => {
            console.log('addItems called with:', items);
            return ipcRenderer.invoke('db:addItems', items);
        },

        updateExpirationDate: (itemName, category, date) => {
            console.log('updateExpirationDate called:', { itemName, category, date });
            return ipcRenderer.invoke('db:updateExpirationDate', itemName, category, date);
        },
        clearInventory: () => {
            console.log('clearInventory called');
            return ipcRenderer.invoke('db:clearInventory');
        },
        deleteItem: (itemName, category) => {
            console.log('deleteItem called:', { itemName, category });
            return ipcRenderer.invoke('db:deleteItem', itemName, category);
        },
        printDatabase: () => ipcRenderer.invoke('db:printDatabase'),
        moveExpiredItems: () => {
            console.log('moveExpiredItems called');
            return ipcRenderer.invoke('db:moveExpiredItems');
        },
        window: {
            minimize: () => ipcRenderer.invoke('window:minimize'),
            hide: () => ipcRenderer.invoke('window:hide'),
        }
    }

});

console.log('Preload script finished loading');
