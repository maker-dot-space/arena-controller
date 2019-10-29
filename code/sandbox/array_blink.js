var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var MCP_Blue_Ready_LED = new Gpio(25, 'high'), //use declare variables for all the GPIO output pins
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
var indexCount = 0; //a counter
dir = "up"; //variable for flowing direction

var flowInterval = setInterval(flowingLeds, 250); //run the flowingLeds function every 1/4sec

function flowingLeds() { //function for flowing Leds
  leds.forEach(function(currentValue) { //for each item in array
    currentValue.writeSync(1); //turn off LED
  });
  if (indexCount == 0) dir = "up"; //set flow direction to "up" if the count reaches zero
  if (indexCount >= leds.length) dir = "down"; //set flow direction to "down" if the count reaches 7
  if (dir == "down") indexCount--; //count downwards if direction is down
  leds[indexCount].writeSync(0); //turn on LED that where array index matches count
  if (dir == "up") indexCount++ //count upwards if direction is up
};

function unexportOnClose() { //function to run when exiting program
  clearInterval(flowInterval); //stop flow interwal
  leds.forEach(function(currentValue) { //for each LED
    currentValue.writeSync(1); //turn off LED
    currentValue.unexport(); //unexport GPIO
  });
};

process.on('SIGINT', unexportOnClose); //function to run when user closes using ctrl+cc