// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

var timerObj = document.getElementById("timer");
var stateObj = document.getElementById("state");

function updateTimer(secs){
    timerObj.innerHTML = secs;
}

function updateAppState(state){
    stateObj.innerHTML = state;
}

