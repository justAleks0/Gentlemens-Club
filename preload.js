// Preload script for Electron
// This runs in the renderer process but has access to Node.js

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    isElectron: true,
    platform: process.platform,
    
    // Export item to The Jukebox folder
    exportItem: (type, data, filename) => {
        return ipcRenderer.invoke('export-item', { type, data, filename });
    },
    
    // Can add more IPC methods here if needed
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
});
