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
var player = require('play-sound')(opts = {})
var startSeconds = 180; // 3 minutes
var secondsLeft = startSeconds;
var arenaApp = {
  timerPause: true,
  playCountdown: false
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
    if(arenaApp.timerPause === false && arenaApp.playCountdown === false){
      // Count down 1 second
      secondsLeft--;
      updateTimer();
    }      
    
    if(secondsLeft == 0)
      pauseTimer();

  }, 1000);
}

//--- Update timer
function updateTimer(){

  // Update the UI
  if(mainWindow !== null) {
    mainWindow.webContents.executeJavaScript(`updateTimer('` + getTimerText() + `')`);
    if(secondsLeft === 30)
      mainWindow.webContents.executeJavaScript(`setTimerColorWhite()`);
  }    
  
}

//--- Return the timer text for the seconds remaining
function getTimerText(){
  
  // Create new date object
  var date = new Date(null);

  // Set the seconds
  date.setSeconds(secondsLeft);

  // Convert to string and return just the minutes and seconds
  if(date.getMinutes() < 10)
    return timeString = date.toISOString().substr(15,4);
  
  return timeString = date.toISOString().substr(14,5);
}

//--- Set the state of the app in the UI
function setAppStateUI(state){ // expects an appState
  
  if(mainWindow !== null){
    app.setUiText(appStates.properties[state].name);
  
    switch(state) {
      case appStates.LOADIN:
        mainWindow.webContents.executeJavaScript(`enableTimerControls()`);
        mainWindow.webContents.executeJavaScript(`setTimerColorDefault()`);
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

//--- Increase/Decrease the timer
app.adjustTimer = function(direction){ // Expects a positive or negative integer

  // Update the seconds
  secondsLeft = secondsLeft + direction;

  // Update the start seconds if applicable
  if((direction === 1 && startSeconds < secondsLeft)
      || (direction === -1 && startSeconds > secondsLeft))
      startSeconds = secondsLeft;
  
  // Update the UI
  updateTimer();
}

function playCountdownToFight(){
  arenaApp.playCountdown = true;
  player.play('./assets/321-FIGHT.mp3');

  setTimeout(function(){
    arenaApp.playCountdown = false;
  }, 4000);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// --- Methods for updating the UI
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//--- Start timer
app.startTimer = function(){
  playCountdownToFight();
  setAppStateUI(appStates.MATCH);
  arenaApp.timerPause = false;
}

//--- Pause timer
app.pauseTimer = function(){
  setAppStateUI(appStates.MATCHPAUSED);
  arenaApp.timerPause = true;  
}

//--- Reset clock
app.resetTimer = function(){
  arenaApp.timerPause = true;
  secondsLeft = startSeconds;
  updateTimer();
  setAppStateUI(appStates.LOADIN);
}

// --- Sets the text displayed in the UI
app.setUiText = function(text){
  mainWindow.webContents.executeJavaScript(`updateAppState('` + text + `')`);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// --- Methods for playing sounds
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function playBlueReady(){
  player.play('./assets/blue.mp3');  
}

function playRedReady(){
  player.play('./assets/red.mp3');  
}

function playTapout(){
  player.play('./assets/tapout-game.mp3');  
}