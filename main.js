const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'icons/icon.jpg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('main.html');
}

app.whenReady().then(() => {
  createWindow();

  if (process.platform === 'win32') {
    app.setAppUserModelId(process.execPath);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

module.exports = { mainWindow };