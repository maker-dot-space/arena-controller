const Gpio = require('onoff').Gpio;
var { Timer } = require('easytimer.js');
var timerInstance = new Timer();

const Start_Button = new Gpio(17, 'in', 'rising', {debounceTimeout: 100});
const Pause_Button = new Gpio(18, 'in', 'rising', {debounceTimeout: 100});
const Reset_Button = new Gpio(27, 'in', 'rising', {debounceTimeout: 100});
const eStop_Button = new Gpio(22, 'in', 'rising', {debounceTimeout: 100});

const MCP_Blue_Ready_LED = new Gpio(25, 'high'), //use declare variables for all the GPIO output pins
  MCP_Red_Ready_LED = new Gpio(5, 'high'),
  Start_Button_LED = new Gpio(16, 'high'),
  Pause_Button_LED = new Gpio(20, 'high'),
  Reset_Button_LED = new Gpio(21, 'high'),
  InMatch_LED = new Gpio(9, 'high'),
  eStop_LED = new Gpio(6, 'high'),
  Standby_LED = new Gpio(26, 'high'),
  WaitForReady_LED = new Gpio(11, 'high');

//Put all the LED variables in an array
var leds = [MCP_Blue_Ready_LED,MCP_Red_Ready_LED,Start_Button_LED,Pause_Button_LED,Reset_Button_LED,InMatch_LED,eStop_LED,Standby_LED,WaitForReady_LED];

///////////////// INITIALIZE
/////////////////////////////////////
function LED_Test_Sequence(){
  for (i=0;i<0;i++){  
    // turn OFF all LEDs
    leds.forEach(function(currentValue) { //for each item in array
      currentValue.writeSync(1); //turn off LED
    });

    leds.forEach(function(currentValue) {
      currentValue.writeSync(0); // LED ON
      msleep(250); // WAIT 0.25 Seconds    
      currentValue.writeSync(1); // LED OFF
    });
  }
  leds.forEach(function(currentValue) {
    currentValue.writeSync(0); // LED ON
  });
  msleep(2000); // WAIT 0.25 Seconds    
  leds.forEach(function(currentValue) {
    currentValue.writeSync(1); // LED OFF
  });
}

///////////////// LOAD-IN STATE
/////////////////////////////////////
// is eStop pressed? 
eStop_Button.watch((err, value) => {
  if (err) {
    throw err;
  }

  //console.log("eStop Button pressed with value=" + value);

  eStop_State = !eStop_State; //flip button state

  if (eStop_State){
    //Safety Light = ON
    eStop_LED.writeSync(0); //ON
    Reset_Button_LED.writeSync(0); //ON
    Standby_LED.writeSync(0); //ON
    SystemState.State = SystemStates.LoadIn;
    
  } else {
    //Safety Light = OFF
    eStop_LED.writeSync(1); //OFF
    Reset_Button_LED.writeSync(1); //ON
    Standby_LED.writeSync(1); //ON
    SystemState.State = SystemStates.PreMatch;    
  }
});

timerInstance.addEventListener('targetAchieved', function (e){
  console.log("BOOM!");
  leds.forEach(function(currentValue) { //for each item in array
    currentValue.writeSync(0); //turn off LED
  });
});

  Start_Button.watch((err, value) => {
    if (err) {
      throw err;
    }
  
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
      
    timerInstance.pause();
    Pause_Button_LED.writeSync(Pause_Button_LED.readSync() ^ 1);
    Standby_LED.writeSync(Standby_LED.readSync() ^ 1);    
    console.log(timerInstance.getTimeValues().toString());
  });

  Reset_Button.watch((err, value) => {
    if (err) {
      throw err;
    }
    
    timerInstance.reset();
    Reset_Button_LED.writeSync(Reset_Button_LED.readSync() ^ 1);
    WaitForReady_LED.writeSync(WaitForReady_LED.readSync() ^ 1);    
  });
  
function unexportOnClose(){
  Start_Button.unexport();      
  Pause_Button.unexport();  
  Reset_Button.unexport();

  leds.forEach(function(currentValue) { //for each item in array
    currentValue.unexport();; //turn off LED
  });
}

process.on('SIGINT', unexportOnClose);
process.on('uncaughtException', function (err) {
  // handle the error safely
  console.log(err);
  unexportOnClose();
});

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function sleep(n) {
  msleep(n*1000);
}

///////////////// EXECUTION
///////////////////////////
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
  
      } else if (value === SystemStates.PreMatch){
        console.log("Match State");
  
      } else {
        // SystemStates.LoadIn
        console.log("Load In State");
      }
    }    
  }
}

const system = new System();
const SystemState = new Proxy(system, SystemState_Handler);

LED_Test_Sequence();
