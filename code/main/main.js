// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    //kiosk: true,
    width: 1500,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  console.log('Waiting on dom');

  mainWindow.webContents.once('dom-ready', ()=> {
    console.log("Dom Ready");
    initializeArena();   
  })
  

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// --- Main App
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const startSeconds = 180; // 3 minutes
var secondsLeft = 180;

var appStates = {
  LOADIN: 1,
  PREMATCH: 2,
  MATCH: 3,
  properties: {
    1: {name: 'Load In'},
    2: {name: 'Pre Match'},
    3: {name: 'Match'}
  }
}
  

function initializeArena(){

  // Set the current state
  mainWindow.webContents.executeJavaScript(`updateAppState('` + appStates.properties[1].name + `')`);
  //mainWindow.webContents.executeJavaScript(`updateAppState('Load In')`);
  //mainWindow.webContents.executeJavaScript(`alert('Howdy')`);

  // Set the initial time left
  mainWindow.webContents.executeJavaScript(`updateTimer(` + startSeconds + `)`);

  // Temp initialization of the timer
  startTimer();
}


function startTimer(){
  
  setInterval(function(){
    mainWindow.webContents.executeJavaScript(`updateTimer(` + secondsLeft + `)`);
    secondsLeft--;
  }, 1000);
}



