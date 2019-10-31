// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    kiosk: true,
    //width: 1500,
    //height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
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

//--- Set constants and variables.
var startSeconds = 180; // 3 minutes
var secondsLeft = startSeconds;
var arenaApp = {
  timerPause: true
};

const appStates = {
  LOADIN: 1,
  PREMATCH: 2,
  MATCH: 3,
  MATCHPAUSED: 4,
  properties: {
    1: {name: 'LOADING IN'},
    2: {name: 'PRE MATCH'},
    3: {name: 'MATCH IN PROGRESS'},
    4: {name: 'MATCH PAUSED'}
  }
}
  
//--- Initialize the arena
function initializeArena(){

  // Set the current state
  setAppStateUI(appStates.LOADIN);
 
  // Set the initial time left
  updateTimer();

  // Initialize the timer
  initializeTimer();

  // TEMP testing starting the timer
  //setTimeout(startTimer, 2000);

}

//--- Initialize the timer intervals
function initializeTimer(){
  arenaApp.timer = setInterval(function(){
    if(arenaApp.timerPause === false){
      // Count down 1 second
      secondsLeft--;
      updateTimer();

      console.log(app.myVar);
    }      
    
    if(secondsLeft == 0)
      pauseTimer();

  }, 1000);
}

//--- Update timer
function updateTimer(){

  // Update the UI
  if(mainWindow !== null)
    mainWindow.webContents.executeJavaScript(`updateTimer('` + getTimerText() + `')`);
  
}

//--- Return the timer text for the seconds remaining
function getTimerText(){
  
  // Determine minutes and seconds left to be displayed
  var s = (secondsLeft % startSeconds);
  var m = 0;
  if(s > 0 || arenaApp.timerPause === false){
    m = Math.floor(s / 60);
  } else {
    m = Math.floor(startSeconds / 60);
  }
  
  s = s % 60;

  // Convert to string.
  var mText = m.toString();
  var sText = s.toString();
  if (s < 10) {
    sText = "0" + sText;
  } 
  return mText + ':' + sText;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// --- Methods for updating the UI
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// -- Set the state of the app in the UI
function setAppStateUI(state){ // expects an appState
  
  if(mainWindow !== null){
    mainWindow.webContents.executeJavaScript(`updateAppState('` + appStates.properties[state].name + `')`);
  
    switch(state) {
      case appStates.LOADIN:
        mainWindow.webContents.executeJavaScript(`enableTimerControls()`);
        break;
      case appStates.PREMATCH:
        mainWindow.webContents.executeJavaScript(`enableTimerControls()`);
        break;
      case appStates.MATCH:
        mainWindow.webContents.executeJavaScript(`disableTimerControls()`);
        break;
    }
  }    
}



//--- Start timer
app.startTimer = function startTimer(){
  setAppStateUI(appStates.MATCH);
  arenaApp.timerPause = false;
}

//--- Pause timer
app.pauseTimer = function pauseTimer(){
  setAppStateUI(appStates.MATCHPAUSED);
  arenaApp.timerPause = true;  
}

//--- Reset clock
app.resetTimer = function resetClock(){
  arenaApp.timerPause = true;
  secondsLeft = startSeconds;
  updateTimer();
  setAppStateUI(appStates.LOADIN);
}




