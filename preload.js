const electron = require('electron');
const { dialog } = require('electron');
const contextBridge = electron.contextBridge;

contextBridge.exposeInMainWorld(
  "api", {
    loadscript(filename){
      require(filename);
    }
  }
);
