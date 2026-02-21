const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

// Enable live reload for development (soft reload only - refreshes renderer)
try {
    require('electron-reload')(__dirname);
    console.log('Live reload enabled!');
} catch (e) {
    console.log('Live reload not available:', e.message);
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'logo.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: '#1A1A1A',
        titleBarStyle: 'default',
        show: false
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Remove X-Frame-Options headers to allow embedding any site
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        const responseHeaders = { ...details.responseHeaders };
        
        // Remove headers that block iframe embedding
        delete responseHeaders['x-frame-options'];
        delete responseHeaders['X-Frame-Options'];
        delete responseHeaders['content-security-policy'];
        delete responseHeaders['Content-Security-Policy'];
        
        callback({ responseHeaders });
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle webview permission requests
app.on('web-contents-created', (event, contents) => {
    contents.on('will-attach-webview', (event, webPreferences, params) => {
        // Enable necessary features for webview
        webPreferences.nodeIntegration = false;
        webPreferences.contextIsolation = true;
        webPreferences.allowRunningInsecureContent = false;
    });

    // Allow all permission requests for embedded content
    contents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        callback(true);
    });
});
