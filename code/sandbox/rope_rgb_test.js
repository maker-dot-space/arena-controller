var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

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
const rgb_Red_LED = new Gpio(18, 'high');
const rgb_Green_LED = new Gpio(19, 'high');
const rgb_Blue_LED = new Gpio(13, 'high');

var arenaApp = {
  timerPause: true,
  playCountdown: false,  
  blink: false,
  blinkInterval: null
};

//var blinkInterval = setInterval(blinkLED, 250); //run the blinkLED function every 250ms
arenaApp.blink = true;
StartBlink([rgb_Red_LED,rgb_Green_LED,rgb_Blue_LED,WaitForReady_LED]);

function blinkLED(LEDS) { //function to start blinking
  for (i=0;i<LEDS.length;i++){
    LEDS[i].writeSync(LEDS[i].readSync() ^ 1);
  }
}

function endBlink(LEDS) { //function to stop blinking
  clearInterval(arenaApp.blinkInterval); // Stop blink intervals
  for (i=0;i<LEDS.length;i++){
    LEDS[i].writeSync(1);
    LEDS[i].unexport(); // Unexport GPIO to free resources
  }  
}

function StartBlink(LEDS) {
  arenaApp.blinkInterval = setInterval(function(){
    if (arenaApp.blink){
      blinkLED(LEDS);
    } else {
      endBlink(LEDS);
    }
  }, 1000); 
}

// setTimeout used to SIMULATING A BUTTON CLICK
setTimeout(function(){arenaApp.blink=false}, 20000); //stop blinking after 5 seconds
