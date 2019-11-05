// Debug Mode
const debugMode = true;

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
    if (debugMode) {console.log("Dom Ready")};
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
var eventEmitter = require('events').EventEmitter
var timer = new eventEmitter.EventEmitter();

var startSeconds = 120; // 3 minutes - Set Timer Length

if (debugMode) { startSeconds=21}; // override time for debugging

var secondsLeft = startSeconds;

const appStates = {
  LOADIN: 1,
  PREMATCH: 2,
  MATCH: 3,
  MATCHPAUSED: 4,
  MATCHFINISHED: 5,
  properties: {
    1: {name: 'LOADING IN'},
    2: {name: 'PRE MATCH'},
    3: {name: 'MATCH IN PROGRESS'},
    4: {name: 'MATCH PAUSED'},
    5: {name: 'MATCH FINISHED'}
  }
}

var arenaApp = {
  timerPause: true,
  playCountdown: false,
  appState: appStates.LOADIN,
  blink: false,
  blinkInterval: null
};

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
    timerTick();
  }, 1000);
}

//--- Timer tick
function timerTick(){
  if(arenaApp.timerPause === false && arenaApp.playCountdown === false){
      // Count down 1 second
      secondsLeft--;

      // Trigger tick event
      timer.emit('tick', secondsLeft);
      updateTimer();
    }      
    
    // Only do this once
    if(secondsLeft == 1 && arenaApp.timerPause === false){
      setTimeout(function(){
        player.play('./assets/air-horn.mp3');
      }, 50)
      
    }

    if(secondsLeft == 0 && arenaApp.timerPause === false){
      setAppStateUI(appStates.MATCHFINISHED);
      arenaApp.timerPause = true;
    }
}


//--- Update timer
function updateTimer(){

  // Update the UI
  if(mainWindow !== null) {
    mainWindow.webContents.executeJavaScript(`updateTimer('` + getTimerText() + `')`);
    if(secondsLeft === 20)
      mainWindow.webContents.executeJavaScript(`setTimerColorEnding()`);

    if(secondsLeft === 1)
      mainWindow.webContents.executeJavaScript(`setTimerStopPulse()`);
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
    arenaApp.appState = state;
  
    switch(state) {
      case appStates.LOADIN:
        mainWindow.webContents.executeJavaScript(`enableTimerControls()`);
        mainWindow.webContents.executeJavaScript(`setTimerColorDefault()`);
        mainWindow.webContents.executeJavaScript(`setTimerStopPulse()`);
        LoadIn(); // GPIO related code during LoadIn State
        break;
      case appStates.PREMATCH:
        mainWindow.webContents.executeJavaScript(`enableTimerControls()`);
        PreMatch(); // GPIO related code during PreMatch State
        break;
      case appStates.MATCH:
        mainWindow.webContents.executeJavaScript(`disableTimerControls()`);
        Match(); // GPIO related code during Match State
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



// --- example of how to add a listner for when the timer ticks
timer.on('tick', function(e){  
  if (debugMode) {console.log(e + " seconds left")};
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// --- GPIO Setup
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Gpio = require('onoff').Gpio;

const Start_Button = new Gpio(17, 'in', 'rising', {debounceTimeout: 100});
const Pause_Button = new Gpio(12, 'in', 'rising', {debounceTimeout: 100});
const Reset_Button = new Gpio(27, 'in', 'rising', {debounceTimeout: 100});
const eStop_Button = new Gpio(22, 'in', 'rising', {debounceTimeout: 100});
const Blue_Ready_Button = new Gpio(23, 'in','rising', {debounceTimeout: 100});
const Red_Ready_Button = new Gpio(24, 'in', 'rising', {debounceTimeout: 100});

const MCP_Blue_Ready_LED = new Gpio(25, 'high');
const MCP_Red_Ready_LED = new Gpio(5, 'high');
const Remote_Blue_Ready_LED = new Gpio(4, 'high');
const Remote_Red_Ready_LED = new Gpio(10, 'high');
const Start_Button_LED = new Gpio(16, 'high');
const Pause_Button_LED = new Gpio(20, 'high');
const Reset_Button_LED = new Gpio(21, 'high');
const InMatch_LED = new Gpio(9, 'high');
const eStop_LED = new Gpio(6, 'high');
const Standby_LED = new Gpio(26, 'high');
const WaitForReady_LED = new Gpio(11, 'high');

//Put all the LED variables in an array
var leds = [Remote_Blue_Ready_LED,MCP_Blue_Ready_LED,MCP_Red_Ready_LED,Remote_Red_Ready_LED,Start_Button_LED,Pause_Button_LED,Reset_Button_LED,InMatch_LED,eStop_LED,Standby_LED,WaitForReady_LED];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// --- GPIO Related Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function LED_ALL_OFF(){
  leds.forEach(function(currentValue) { //for each item in array
    currentValue.writeSync(1); //turn off LED
  });
}

function LED_ALL_ON(){
  leds.forEach(function(currentValue) { //for each item in array
    currentValue.writeSync(0); //turn ON LED
  });
}

function LED_Test_Sequence(){
  if (debugMode) {console.log('MCP Start Up Test Started')};
  
  for (i=0;i<2;i++){  
    // turn OFF all LEDs
    LED_ALL_OFF();

    leds.forEach(function(currentValue) {
      currentValue.writeSync(0); // LED ON
      msleep(500); // WAIT 0.5 Seconds    
      currentValue.writeSync(1); // LED OFF
    });
  }
  LED_ALL_ON();
  msleep(2000); // WAIT 2 Seconds    
  LED_ALL_OFF();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// --- GPIO Button Watchers
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
eStop_Button.watch((err, value) => {
  if (err) {
    throw err;
  }
  app.pauseTimer();

  app.setUiText('Emergency Stop Activated');

  eStop_State = !eStop_State; //flip button state

  if (eStop_State){
    SystemState.State = SystemStates.LoadIn;    
  } else {   
    SystemState.State = SystemStates.PreMatch;    
  }
});

Start_Button.watch((err, value) => {
  if (err) {
    throw err;
  }

  if (debugMode) {console.log("Start Pressed")};

  Start_Button_LED.writeSync(Start_Button_LED.readSync() ^ 1);
  InMatch_LED.writeSync(InMatch_LED.readSync() ^ 1);
  app.startTimer();
});

Pause_Button.watch((err, value) => {    
  if (err) {
    throw err;
  }

  if (debugMode) {console.log("Pause Pressed")};

  Pause_Button_LED.writeSync(Pause_Button_LED.readSync() ^ 1);
  Standby_LED.writeSync(Standby_LED.readSync() ^ 1);    
  app.pauseTimer();
  
  // GPIO Related Code
  LED_ALL_OFF();
  Start_Button_LED.writeSync(0); // ON
  Reset_Button_LED.writeSync(0); // ON
  InMatch_LED.writeSync(0); // ON
  Standby_LED.writeSync(0); // ON
});

Reset_Button.watch((err, value) => {
  if (err) {
    throw err;
  }
  
  if (debugMode) {console.log("Reset Pressed")};
  Reset_Button_LED.writeSync(Reset_Button_LED.readSync() ^ 1);
  WaitForReady_LED.writeSync(WaitForReady_LED.readSync() ^ 1);
  app.resetTimer();
});

Blue_Ready_Button.watch((err, value) => {
  if (err) {
    throw err;
  }
  
  if (debugMode) {console.log("Blue Ready Button Pressed")};
  
  Remote_Blue_Ready_LED.writeSync(0);
  
  playBlueReady();
})

Red_Ready_Button.watch((err, value) => {
  if (err) {
    throw err;
  }
  
  if (debugMode) {console.log("Red Ready Button Pressed")};
  Remote_Red_Ready_LED.writeSync(0);
  
  playRedReady();
})

function unexportOnClose(){
  Start_Button.unexport();      
  Pause_Button.unexport();  
  Reset_Button.unexport();

  LED_ALL_OFF();
}

function LoadIn(){
  //if (blinkInterval){clearInterval(blinkInterval)};

  LED_ALL_OFF(); // set LEDs to known state which is OFF

  //Safety Light = ON
  eStop_LED.writeSync(0); //ON
  Reset_Button_LED.writeSync(0); //ON
  Standby_LED.writeSync(0); //ON
}

function PreMatch(){
  LED_ALL_OFF(); // set LEDs to known state which is OFF

  //Safety Light = OFF
  WaitForReady_LED.writeSync(0); //ON
  
  Blink_Ready(1);
}

function Match(){
  LED_ALL_OFF(); // set LEDs to known state which is OFF

  InMatch_LED.writeSync(0); //ON
  Pause_Button_LED.writeSync(0); // ON to indicate it is available to use

}

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function sleep(n) {
  msleep(n*1000);
}


var eStop_State = false; // initial value of eStop is OFF (safe)

const SystemStates = {
  LoadIn: 1,
  PreMatch: 2,
  Match: 3
}

function System() {
  this.State = SystemStates.LoadIn;
}

const SystemState_Handler = {
  set(obj, prop, value){
    //console.log("Prop=" + prop + " Value=" + value);

    if (prop === 'State'){
      if (value === SystemStates.PreMatch){
        console.log("Pre-Match State");
        PreMatch();
  
      } else if (value === SystemStates.PreMatch){
        console.log("Match State");
  
      } else {
        // SystemStates.LoadIn
        console.log("Load In State");
        LoadIn();
      }
    }    
  }
}

const system = new System();
const SystemState = new Proxy(system, SystemState_Handler);

////////////////////////////////////////////
//setTimeout(endBlink, 5000); //stop blinking after 5 seconds

function blinkLED(led) { //function to start blinking
  if (led.readSync() === 0) { //check the pin state, if the state is 0 (or off)
    led.writeSync(1); //set pin state to 1 (turn LED on)

  } else {
    led.writeSync(0); //set pin state to 0 (turn LED off)
  }
}

function endBlink(led) { //function to stop blinking
  clearInterval(blinkInterval); // Stop blink intervals
  led.writeSync(1); // Turn LED off
  //InMatch_LED.unexport(); // Unexport GPIO to free resources
}
////////////////////////////////////////////
// MCP_Blue_Ready_LED.writeSync(0);
// MCP_Red_Ready_LED.writeSync(0);
// setTimeout(function(){MCP_Red_Ready_LED.writeSync(1)}, 5000);
// setTimeout(function(){MCP_Blue_Ready_LED.writeSync(1)}, 5000);

function Blink_Ready(leds){
  //leds: OFF,ALL,RED,BLUE 0,1,2,3
  if (leds===1){
    //turn all ON
    MCP_Blue_Ready_LED.writeSync(0); //ON
    MCP_Red_Ready_LED.writeSync(0); //ON
  } else if (leds===2) {
    //turn off Blue, let Red cont
    MCP_Blue_Ready_LED.writeSync(1); //OFF
    MCP_Red_Ready_LED.writeSync(0); //ON
  } else if (leds===3) {
    //turn off Red, let Blue cont
    MCP_Blue_Ready_LED.writeSync(0); //ON
    MCP_Red_Ready_LED.writeSync(1); //OFF
  } else {
    //turn all OFF
    MCP_Blue_Ready_LED.writeSync(1); //OFF
    MCP_Red_Ready_LED.writeSync(1); //OFF
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// --- Blink Function
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function blinkLED(LEDS) { //function to start blinking
  for (i=0;i<LEDS.length;i++){
    LEDS[i].writeSync(LEDS[i].readSync() ^ 1);
  }
}

function endBlink(LEDS) { //function to stop blinking
  clearInterval(arenaApp.blinkInterval); // Stop blink intervals
  for (i=0;i<LEDS.length;i++){
    LEDS[i].writeSync(1);    
  }  
}

function stopBlink(){
  arenaApp.blink = false;
}

function StartBlink(LEDS) {
  arenaApp.blink = true;

  arenaApp.blinkInterval = setInterval(function(){
    if(debugMode){"Starting Blink"};

    if (arenaApp.blink){
      blinkLED(LEDS);
    } else {
      endBlink(LEDS);
    }
  }, 250); 
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// --- LED Initilization
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
LED_ALL_OFF(); // turn off ALL LEDs to start
LED_Test_Sequence(); // turn each LED on/off in sequence then flash ALL leds for 2 seconds

// TURN OFF BEFORE PRODUCTION! 

StartBlink([MCP_Blue_Ready_LED,MCP_Red_Ready_LED,WaitForReady_LED]);
// setTimeout used to SIMULATING A BUTTON CLICK
setTimeout(function(){stopBlink()}, 5000); //stop blinking after 5 seconds
