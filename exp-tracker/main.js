import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { app, BrowserWindow, ipcMain, Notification, Tray, Menu } from 'electron';
import dbOps from './src/db/operations.js';
import schedule from 'node-schedule';
import { sendExpirationEmail } from './src/utils/emailService.js';
const clockIcon = path.join(__dirname, './src/assets/clock.png');

let mainWindow;
let tray;
let isQuiting = false;


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        fullscreenable: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, './preload.cjs')
        }
    });

    mainWindow.loadURL("http://localhost:5173/");
    mainWindow.maximize();

    mainWindow.webContents.openDevTools();

    // Prevent window from being garbage collected
    mainWindow.on('close', (event) => {
        if (!isQuiting) {
            event.preventDefault();
            mainWindow.hide();
            return false;
        }
        return true;
    })
}

function createTray() {
    tray = new Tray(clockIcon);

    // Create context menu
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Open Expiration Tracker",
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                }
            }
        },
        {
            type: 'separator'
        },
        {
            label: "Check Expired Items",
            click: async () => {
                try {
                    const expiredItems = dbOps.getExpiredItems();
                    if (expiredItems.length >= 0) {
                        new Notification({
                            title: 'Expired Items Found',
                            body: `${expiredItems.length} items have expired.`,
                        }).show();
                    }
                } catch (error) {
                    console.error('Error checking expired items: ', error);
                }
            }
        },

        {
            type: 'separator'
        },
        {
            label: 'Quit',
            click: () => {
                isQuiting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Expiration Tracker');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        if (mainWindow) {
            mainWindow.show();
        }
    })


    tray.on('right-click', () => {
        if (contextMenu) {
            tray.popUpContextMenu(contextMenu);
        }
    })
}

// Schedule a job to move expired items every day at 12:00 AM

function setupDailyCheck() {
    console.log('Initial table state:');
    dbOps.checkTables();
    // check for expired items
    const checkExpiredItems = async () => {
        try {
            const expiredItems = await dbOps.moveExpiredItems();

            if (expiredItems.length > 0) {
                // Show expired items notification
                new Notification({
                    title: 'Expired Items Found',
                    body: `${expiredItems.length} items have expired.`,
                }).show();

                await sendExpirationEmail(expiredItems);
                console.log(`${expiredItems.length} expired items moved and notification sent`);

            } else {
                console.log('No expired items found');
            }
        } catch (error) {
            console.error('Error moving expired items: ', error);
        }
    }

    checkExpiredItems();

    // schedule daily check
    schedule.scheduleJob('0 0 * * *', checkExpiredItems)
}

// Set up IPC handlers
function setupIpcHandlers() {

    ipcMain.handle('db:getAllItems', () => {
        return dbOps.getAllItems();
    });

    ipcMain.handle('db:addItems', (_, items) => {
        return dbOps.addItems(items);
    });

    ipcMain.handle('db:updateExpirationDate', (event, itemName, date) => {
        console.log("update exp date log: ", event)
        try {
            console.log('Received update request:', { itemName, date });
            return dbOps.updateExpirationDate(itemName, date);

        } catch (error) {
            console.error('Error in updateExpirationDate handler:', error);
            throw error;
        }
    });

    ipcMain.handle('db:clearInventory', () => {
        return dbOps.clearInventory();
    });

    ipcMain.handle('db:deleteItem', (itemName) => {
        return dbOps.deleteItem(itemName);
    });

    ipcMain.handle(`db:restoreExpiredItem`, (event, itemName) => {
        // console.log('restore expired item name: ', itemName);
        try {
            console.log('Received restore request:', itemName);
            return dbOps.restoreExpiredItem(itemName);
        } catch (error) {

            console.error('Error restoring expired item: ', error);
            return false;
        }
    })

    ipcMain.handle('db:moveExpiredItems', async () => {
        try {
            return dbOps.moveExpiredItems();
        } catch (error) {
            console.error('Error moving expired items: ', error);
            return [];
        }
    });

    ipcMain.handle('db:getExpiredItems', async () => {
        return dbOps.getExpiredItems();
    });

    ipcMain.on('window:minimize', () => {
        mainWindow.minimize();
    });


    ipcMain.on('window:hide', () => {
        mainWindow.hide();
    });

}

app.whenReady().then(() => {
    createWindow();
    createTray();
    setupIpcHandlers();
    setupDailyCheck();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', (event) => {
    if (process.platform !== 'darwin') {
        event.preventDefault();
    }
});

app.on('before-quit', () => {
    isQuiting = true;
});

app.on('quit', () => {
    tray = null;
});
