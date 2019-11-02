const Gpio = require('onoff').Gpio;
var { Timer } = require('easytimer.js');
var timerInstance = new Timer();

const Start_Button = new Gpio(16, 'in', 'rising', {debounceTimeout: 100});
const Pause_Button = new Gpio(6, 'in', 'rising', {debounceTimeout: 100});
const Reset_Button = new Gpio(5, 'in', 'rising', {debounceTimeout: 100});
const eStop_Button = new Gpio(25, 'in', 'rising', {debounceTimeout: 100});
const Blue_Ready_Button = new Gpio(13, 'in', 'both', {debounceTimeout: 100});
const Red_Ready_Button = new Gpio(27, 'in', 'both', {debounceTimeout: 100});

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

var iStart = 1, iPause = 1, iReset = 1, ieStop = 1 , iBlueReady = 1, iRedReady = 1;

///////////////// INITIALIZE
/////////////////////////////////////
function LED_Test_Sequence(){
    console.log("Starting MCP Test Sequence");
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
  console.log("MCP Ready for Action");
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

Start_Button.watch((err, value) => {
    if (err) {
      throw err;
    }
    console.log("Start Pressed " + iStart + " times");
    iStart += 1;
    Start_Button_LED.writeSync(Start_Button_LED.readSync() ^ 1);
    InMatch_LED.writeSync(InMatch_LED.readSync() ^ 1);
  });

Pause_Button.watch((err, value) => {
    if (err) {
        throw err;
    }
    console.log("Pause Pressed " + iPause + " times");
    iPause += 1;
    Pause_Button_LED.writeSync(Pause_Button_LED.readSync() ^ 1);
    Standby_LED.writeSync(Standby_LED.readSync() ^ 1);    
});

Reset_Button.watch((err, value) => {
    if (err) {
        throw err;
    }
    console.log("Reset Pressed " + iReset + " times");
    iReset += 1;
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

function msleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function sleep(n) {
    msleep(n*1000);
}


LED_Test_Sequence();