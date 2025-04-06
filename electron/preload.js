//preload.js

//import { contextBridge, ipcRenderer, app } from "electron";

const { contextBridge, app, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveFile: (data) => ipcRenderer.send("save-file", data),
  receiveFile: (callback) => ipcRenderer.on("receive-file", callback),
});
