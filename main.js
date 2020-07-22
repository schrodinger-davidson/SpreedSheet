const { ipcMain,app, BrowserWindow } = require('electron')
const ejs= require('ejs-electron')

ejs.data({
  "title":"Excel-clone",
  "rows":100,
  "cols": 26
})

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    icon: __dirname + './log.png'
  })

  // and load the index.html of the app. renderer process
  win.loadFile('index.ejs').then(function(){
      // Open the DevTools.
      win.webContents.openDevTools();
      win.show();
      win.maximize();
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
ipcMain.on('close-me', (evt, arg) => {
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
