// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const remote = require('electron').remote;

var renderer = {};

$(document).ready(function () {

    renderer.timerObj = $("#timer");
    renderer.stateObj = $("#state");

    enableTimerControls();

});




// --- Methods available to the main process

// --- Events -------------------------------
function enableTimerControls(){
    var ctrls = $("#timerControls");
    ctrls.on("mouseenter", function(){
        ctrls.animate({opacity: 1}, 300)
    });

    ctrls.on("mouseleave", function(){
        ctrls.animate({opacity: 0}, 500)
    });
}

function disableTimerControls(){
    
}

// --- UI updates ---------------------------------
function updateTimer(secs){
    if(renderer.timerObj !== undefined)
        renderer.timerObj.html(secs);
}

function updateAppState(state){
    if(renderer.stateObj !== undefined)
        renderer.stateObj.html(state);
}







