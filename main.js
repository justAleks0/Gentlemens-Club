const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

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

// IPC handler for exporting items to The Jukebox
ipcMain.handle('export-item', async (event, { type, data, filename }) => {
    try {
        const jukeboxPath = path.join(__dirname, 'The Jukebox');
        
        // Map type to subfolder
        const subfolders = {
            'video': 'Video',
            'site': 'Site',
            'creator': 'Creator',
            'playlist': 'Playlist'
        };
        
        const subfolder = subfolders[type] || type;
        const folderPath = path.join(jukeboxPath, subfolder);
        
        // Ensure folder exists
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        
        // Clean filename (remove invalid characters)
        const cleanFilename = filename.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
        const filePath = path.join(folderPath, `${cleanFilename}.json`);
        
        // Write the JSON file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        
        return { success: true, path: filePath };
    } catch (error) {
        console.error('Export error:', error);
        return { success: false, error: error.message };
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
    
    // Prevent new windows from opening - navigate in same webview instead
    contents.setWindowOpenHandler(({ url }) => {
        // If it's a webview, navigate to the URL instead of opening new window
        if (contents.getType() === 'webview') {
            contents.loadURL(url);
        }
        return { action: 'deny' };
    });
    
    // Also handle will-navigate to keep navigation within webview
    contents.on('will-navigate', (event, url) => {
        // Allow navigation within the webview
    });
});
