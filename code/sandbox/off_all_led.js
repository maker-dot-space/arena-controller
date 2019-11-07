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