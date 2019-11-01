const Gpio = require('onoff').Gpio;
var { Timer } = require('easytimer.js');
var timerInstance = new Timer();

const Start_Button = new Gpio(16, 'in', 'rising', {debounceTimeout: 100});
const Pause_Button = new Gpio(6, 'in', 'rising', {debounceTimeout: 100});
const Reset_Button = new Gpio(5, 'in', 'rising', {debounceTimeout: 100});
const eStop_Button = new Gpio(25, 'in', 'rising', {debounceTimeout: 100});
const Blue_Ready_Button = new Gpio(13, 'in', 'falling', {debounceTimeout: 100});
const Red_Ready_Button = new Gpio(27, 'in', 'falling', {debounceTimeout: 100});

const MCP_Blue_Ready_LED = new Gpio(22, 'high'), //use declare variables for all the GPIO output pins
  MCP_Red_Ready_LED = new Gpio(23, 'high'),
  Remote_Blue_Ready_LED = new Gpio(26, 'high'),
  Remote_Red_Ready_LED = new Gpio(21, 'high'),
  Start_Button_LED = new Gpio(7, 'high'),
  Pause_Button_LED = new Gpio(8, 'high'),
  Reset_Button_LED = new Gpio(11, 'high'),
  InMatch_LED = new Gpio(9, 'high'),
  eStop_LED = new Gpio(24, 'high'),
  Standby_LED = new Gpio(10, 'high'),
  WaitForReady_LED = new Gpio(18, 'high');

//Put all the LED variables in an array
var leds = [Remote_Blue_Ready_LED,MCP_Blue_Ready_LED,MCP_Red_Ready_LED,Remote_Red_Ready_LED,Start_Button_LED,Pause_Button_LED,Reset_Button_LED,InMatch_LED,eStop_LED,Standby_LED,WaitForReady_LED];

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

///////////////// INITIALIZE
/////////////////////////////////////
function LED_Test_Sequence(){
  for (i=0;i<1;i++){  
    // turn OFF all LEDs
    LED_ALL_OFF();

    leds.forEach(function(currentValue) {
      currentValue.writeSync(0); // LED ON
      msleep(250); // WAIT 0.25 Seconds    
      currentValue.writeSync(1); // LED OFF
    });
  }
  LED_ALL_ON();
  msleep(2000); // WAIT 0.25 Seconds    
  LED_ALL_OFF();
}

eStop_Button.watch((err, value) => {
  if (err) {
    throw err;
  }

  eStop_State = !eStop_State; //flip button state

  if (eStop_State){
    SystemState.State = SystemStates.LoadIn;    
  } else {   
    SystemState.State = SystemStates.PreMatch;    
  }
});

timerInstance.addEventListener('targetAchieved', function (e){
  LED_ALL_ON();
  msleep(2000);
  console.log("BOOM!");
  LED_ALL_OFF();

});

  Start_Button.watch((err, value) => {
    if (err) {
      throw err;
    }
    console.log("Start Pressed");
    Start_Button_LED.writeSync(Start_Button_LED.readSync() ^ 1);
    InMatch_LED.writeSync(InMatch_LED.readSync() ^ 1);    
    if (timerInstance.isRunning()){
      timerInstance.start(); // RESUME
      console.log(timerInstance.getTimeValues().toString());
    } else {
      timerInstance.start({countdown: true, startValues: {seconds: 5}}); // START COUNTDOWN TIMER 5 SECONDS
      console.log(timerInstance.getTimeValues().toString());
    }    
  });

  Pause_Button.watch((err, value) => {
    if (err) {
      throw err;
    }
    console.log("Pause Pressed");
      
    timerInstance.pause();
    Pause_Button_LED.writeSync(Pause_Button_LED.readSync() ^ 1);
    Standby_LED.writeSync(Standby_LED.readSync() ^ 1);    
    console.log(timerInstance.getTimeValues().toString());
  });

  Reset_Button.watch((err, value) => {
    if (err) {
      throw err;
    }
    console.log("Reset Pressed");
    timerInstance.reset();
    Reset_Button_LED.writeSync(Reset_Button_LED.readSync() ^ 1);
    WaitForReady_LED.writeSync(WaitForReady_LED.readSync() ^ 1);    
  });
  
function unexportOnClose(){
  Start_Button.unexport();      
  Pause_Button.unexport();  
  Reset_Button.unexport();

  LED_ALL_OFF();
}

process.on('SIGINT', unexportOnClose);
process.on('uncaughtException', function (err) {
  // handle the error safely
  console.log(err);
  unexportOnClose();
});

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

LED_Test_Sequence();

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