import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { app, BrowserWindow, ipcMain } from 'electron';
import dbOps from './src/db/operations.js';
import schedule from 'node-schedule';
import { sendExpirationEmail } from './src/utils/emailService.js';


function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, './preload.cjs')
        }
    });

    mainWindow.loadURL("http://localhost:5173/");

    mainWindow.webContents.openDevTools();
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

    ipcMain.handle('db:updateExpirationDate', (_, itemName, category, date) => {
        return dbOps.updateExpirationDate(itemName, category, date);
    });

    ipcMain.handle('db:clearInventory', () => {
        return dbOps.clearInventory();
    });

    ipcMain.handle('db:deleteItem', (_, itemName, category) => {
        return dbOps.deleteItem(itemName, category);
    });

    ipcMain.handle('db:moveExpiredItems', () => {
        return dbOps.moveExpiredItems();
    })

}

app.whenReady().then(() => {
    createWindow();
    setupIpcHandlers();
    setupDailyCheck();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});