var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

const Start_Button = new Gpio(17, 'in', 'falling', {debounceTimeout: 100});
const Pause_Button = new Gpio(12, 'in', 'falling', {debounceTimeout: 100});
const Reset_Button = new Gpio(27, 'in', 'falling', {debounceTimeout: 100});
const eStop_Button = new Gpio(22, 'in', 'falling', {debounceTimeout: 100});
const Blue_Ready_Button = new Gpio(23, 'in', 'rising', {debounceTimeout: 100});
const Red_Ready_Button = new Gpio(24, 'in', 'rising', {debounceTimeout: 100});

const MCP_Blue_Ready_LED = new Gpio(25, 'high'), //use declare variables for all the GPIO output pins
  MCP_Red_Ready_LED = new Gpio(5, 'high'),
  Remote_Blue_Ready_LED = new Gpio(4, 'high'),
  Remote_Red_Ready_LED = new Gpio(10, 'high'),
  Start_Button_LED = new Gpio(16, 'high'),
  Pause_Button_LED = new Gpio(20, 'high'),
  Reset_Button_LED = new Gpio(21, 'high'),
  InMatch_LED = new Gpio(9, 'high'),
  eStop_LED = new Gpio(6, 'high'),
  Standby_LED = new Gpio(26, 'high'),
  WaitForReady_LED = new Gpio(11, 'high');

//Put all the LED variables in an array
var leds = [MCP_Blue_Ready_LED,MCP_Red_Ready_LED,Start_Button_LED,Pause_Button_LED,Reset_Button_LED,InMatch_LED,eStop_LED,Standby_LED,WaitForReady_LED,Remote_Blue_Ready_LED,Remote_Red_Ready_LED];

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
    console.log("Starting MCP Test Sequence");
  for (i=0;i<1;i++){  
    // turn OFF all LEDs
    LED_ALL_OFF();

    leds.forEach(function(currentValue) {
      currentValue.writeSync(0); // LED ON
      msleep(400); // WAIT 0.4 Seconds    
      currentValue.writeSync(1); // LED OFF
    });
  }
  LED_ALL_ON();
  msleep(1000); // WAIT 1 Seconds    
  LED_ALL_OFF();
  console.log("MCP Ready");
}

eStop_Button.watch((err, value) => {
  if (err) {
    throw err;
  }

  console.log("eStop Pressed");

  eStop_LED.writeSync(eStop_LED.readSync() ^ 1);

});

Blue_Ready_Button.watch((err, value) => {
	if (err) {
		throw err;
	}
  console.log("Blue Ready Pressed");
  
  MCP_Blue_Ready_LED.writeSync(MCP_Blue_Ready_LED.readSync() ^ 1);
  Remote_Blue_Ready_LED.writeSync(Remote_Blue_Ready_LED.readSync() ^ 1);

});

Red_Ready_Button.watch((err, value) => {
      	if (err) {
		throw err;
	}
  console.log("Red Ready Pressed");
  
  MCP_Red_Ready_LED.writeSync(MCP_Red_Ready_LED.readSync() ^ 1);
  Remote_Red_Ready_LED.writeSync(Remote_Red_Ready_LED.readSync() ^ 1);
}); 

Start_Button.watch((err, value) => {
    if (err) {
      throw err;
    }
    console.log("Start Pressed");
    
    Start_Button_LED.writeSync(Start_Button_LED.readSync() ^ 1);
    InMatch_LED.writeSync(InMatch_LED.readSync() ^ 1);
  });

Pause_Button.watch((err, value) => {
  if (err) {
    throw err;
  }
  console.log("Pause Pressed");
  
  Pause_Button_LED.writeSync(Pause_Button_LED.readSync() ^ 1);
  Standby_LED.writeSync(Standby_LED.readSync() ^ 1);
});

Reset_Button.watch((err, value) => {
  if (err) {
    throw err;
  }

  console.log("Reset Pressed");

  Reset_Button_LED.writeSync(Reset_Button_LED.readSync() ^ 1);
  WaitForReady_LED.writeSync(WaitForReady_LED.readSync() ^ 1);
})

function msleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function sleep(n) {
    msleep(n*1000);
}


LED_Test_Sequence();

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
