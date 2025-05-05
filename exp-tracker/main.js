import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { app, BrowserWindow, ipcMain, Notification, Tray, Menu } from 'electron';
import dbOps from './src/db/operations.js';
import schedule from 'node-schedule';
import { sendEmail, } from './src/utils/emailService.js';
import isDev from 'electron-is-dev';

const clockIcon = path.join(__dirname, './src/assets/clock.png');

let mainWindow;
let tray;
let isQuiting = false;


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 1024,
        fullscreenable: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, './preload.cjs')
        }
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173')
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }

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
    // console.log('Initial table state:');
    // dbOps.checkTables();
    // check for expired items
    const checkExpiredItems = async () => {
        try {
            const expiredItems = dbOps.moveExpiredItems();

            if (expiredItems.length > 0) {
                // Show expired items notification
                new Notification({
                    title: 'Spoilage Alert',
                    body: `${expiredItems.length} items have expired!`,
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

function setupPreemptiveExpirationCheck(numDays) {
    console.log('Checking for items expiring in %d days', numDays);

    // function to check for items expiring soon
    const checkExpiringSoon = async () => {
        try {
            const expiredItems = await dbOps.moveExpiredItems();
            const soonExpiringItems = await dbOps.getItemsExpiringSoon(numDays);

            if (expiredItems.length > 0) {
                // Show expired items notification
                new Notification({
                    title: 'Spoilage Alert',
                    body: `${expiredItems.length} items have expired!`,
                }).show();
            } else {
                console.log('No expired items found');
            }


            if (soonExpiringItems.length > 0) {
                console.log(soonExpiringItems)

                // send desktop notification
                new Notification({
                    title: 'Spoilage Alert',
                    body: `${soonExpiringItems.length} items expiring in ${numDays} days!`,
                }).show();

                const emails = dbOps.getNotificationEmails();

                // send email notification
                await sendEmail(expiredItems, numDays, soonExpiringItems, emails);
                console.log(`${soonExpiringItems.length} items expiring soon! Notifications sent!`);

            } else {
                console.log('No items will spoil in %d days', numDays);
            }
        } catch (error) {
            console.error('Error finding items that will expire within the next %d days:', numDays, error)
        }
    };

    // initial check
    checkExpiringSoon();

    // schedule daily check
    schedule.scheduleJob('0 0 * * *', () => checkExpiringSoon());
}

// Set up IPC handlers
function setupIpcHandlers() {

    ipcMain.handle('db:getAllItems', () => {
        try {
            return dbOps.getAllItems();
        } catch (error) {
            console.error('Error getting all items', error)
            throw error;
        }
    });

    ipcMain.handle('db:isFirstLaunch', () => {
        try {
            return dbOps.isFirstLaunch();
        } catch (error) {
            console.error('Error checking isFirstLaunch', error);
            throw error;
        }
    });

    ipcMain.handle('db:addUser', async (_, user) => {
        try {
            return dbOps.addUser(user);
        } catch (error) {
            console.error('Error adding user', error);
            throw error;
        }
    })

    ipcMain.handle('db:isOnboardingComplete', () => {
        try {
            return dbOps.isOnboardingComplete();
        } catch (error) {
            console.error('Error checking isOnboardingComplete', error)
        }
    })

    ipcMain.handle('db:addItems', (_, items) => {
        try {
            return dbOps.addItems(items);
        } catch (error) {
            console.error('Error adding items', error)
        }
    });
    ipcMain.handle('db:addItem', (_, itemName) => {
        try {
            return dbOps.addItem(itemName);
        } catch (error) {
            console.error('Error add Item', error)
        }
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

    ipcMain.handle('db:deleteItem', (event, item) => {
        return dbOps.deleteItem(item);
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

    ipcMain.handle('db:getExpirationDetails', async (event, item) => {
        try {
            console.log('Received request to get expiration details for: ', item);
            return dbOps.getExpirationDetails(item);
        } catch (error) {
            console.error('Error retrieving expiration details: ', error)
            return [];
        }
    });

    ipcMain.handle('db:setAsExpired', async (event, item) => {
        try {
            console.log('Received request to set item as expired for: ', item);
            return dbOps.setAsExpired(item);
        } catch (error) {
            console.error('Error setting as expired: ', error)
            return false
        }
    });

    ipcMain.handle('db:getExpiredItems', async () => {
        return dbOps.getExpiredItems();
    });

    ipcMain.handle('db:getItemsExpiringSoon', async (event, numDays) => {
        try {
            const items = await dbOps.getItemsExpiringSoon(numDays);
            return items;
        } catch (error) {
            console.error('Error fetching expiring items:', error);
            return [];
        }
    });

    ipcMain.handle('db:removeFromInventory', async (event, itemName) => {
        try {
            dbOps.removeFromInventory(itemName);
        } catch (error) {
            console.error('Error removing item from inventory:', error);
        }
    });

    ipcMain.handle('db:getItemsWithExpiration', () => {
        try {
            return dbOps.getItemsWithExpiration();
        } catch (error) {
            console.error('Error fetching items with expiration dates: ', error);
            return [];
        }
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
    setupPreemptiveExpirationCheck(30);

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
