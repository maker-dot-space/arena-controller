var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(19, 'out'); //use GPIO pin 4, and specify that it is output
var LED2 = new Gpio(26, 'out');

var blinkInterval = setInterval(blinkLED, 250); //run the blinkLED function every 250ms
var what = setInterval(blinkLED2, 500);

function blinkLED2() {
  if (LED2.readSync() === 0) { //check the pin state, if the state is 0 (or off)
    LED2.writeSync(1); //set pin state to 1 (turn LED on)
  } else {
    LED2.writeSync(0); //set pin state to 0 (turn LED off)
  }
}

function blinkLED() { //function to start blinking
  if (LED.readSync() === 0) { //check the pin state, if the state is 0 (or off)
    LED.writeSync(1); //set pin state to 1 (turn LED on)
  } else {
    LED.writeSync(0); //set pin state to 0 (turn LED off)
  }
}

function endBlink() { //function to stop blinking
  clearInterval(blinkInterval); // Stop blink intervals
  LED.writeSync(0); // Turn LED off
  LED.unexport(); // Unexport GPIO to free resources
}

function endBlink2() {
  clearInterval(what);
  LED2.writeSync(0);
  LED2.unexport();
}

setTimeout(endBlink, 5000); //stop blinking after 5 seconds
setTimeout(endBlink2, 5000); //stop blinking after 5 seconds