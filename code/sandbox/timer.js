const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var { Timer } = require('easytimer.js');
var timerInstance = new Timer();

const Start_Button = new Gpio(17, 'in', 'rising', {debounceTimeout: 10});
const Pause_Button = new Gpio(18, 'in', 'rising', {debounceTimeout: 10});
const Reset_Button = new Gpio(27, 'in', 'rising', {debounceTimeout: 10});

const MCP_Blue_Ready_LED = new Gpio(25, 'high'), //use declare variables for all the GPIO output pins
  MCP_Red_Ready_LED = new Gpio(5, 'high'),
  Start_Button_LED = new Gpio(16, 'high'),
  Pause_Button_LED = new Gpio(20, 'high'),
  Reset_Button_LED = new Gpio(21, 'high'),
  InMatch_LED = new Gpio(19, 'high'),
  eStop_LED = new Gpio(6, 'high'),
  Standby_LED = new Gpio(26, 'high'),
  WaitForReady_LED = new Gpio(12, 'high');

//Put all the LED variables in an array
var leds = [MCP_Blue_Ready_LED,MCP_Red_Ready_LED,Start_Button_LED,Pause_Button_LED,Reset_Button_LED,InMatch_LED,eStop_LED,Standby_LED,WaitForReady_LED];

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