import { app, BrowserWindow, ipcMain, Notification } from "electron";
import path from "path";


function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            // preload: path.join(__dirname, "preload.js")
        },
    });

    win.loadURL("http://localhost:5173/");
}

ipcMain.on("parse-file", (event, fileData) => {
    const parsedData = parseCSV(fileData);
    event.reply("file-parsed", parsedData)
})

app.whenReady().then(createWindow);

// Quit when all windows are closed (macOS)
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});