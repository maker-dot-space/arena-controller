// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const remote = require('electron').remote;

var renderer = {
    timerSkip: false
};

$(document).ready(function () {

    renderer.timerObj = $("#timer");
    renderer.stateObj = $("#state");
    enableStateControls();
});




// --- Methods available to the main process

// --- Events -------------------------------
function enableTimerControls(){
    
    // Display/Hide
    var ctrls = $("#timerControls");
    ctrls.on("mouseenter", function(){
        ctrls.animate({opacity: 1}, 300)
    });

    ctrls.on("mouseleave", function(){
        ctrls.animate({opacity: 0}, 500)
    });

    // Button events
    $("#timerUp").on("click", function(){
        if(renderer.timerSkip === false)
            remote.app.adjustTimer(1);
    });

    $("#timerDown").on("click", function(){
        if(renderer.timerSkip === false)
            remote.app.adjustTimer(-1);
    });

    // Rapid timer adjustments
    $("#timerUp").on("mousedown", function(){
        timerSkip(5);       
    });

    $("#timerDown").on("mousedown", function(){
        timerSkip(-5);       
    });

    $("#timerUp").on("mouseup", function(){
        stopTimerSkip();       
    });

    $("#timerDown").on("mouseup", function(){
        stopTimerSkip();
    });
}

function timerSkip(skipVal){
    renderer.mouseTimeout = setTimeout(function(){
        renderer.timerSkip = true;
        renderer.timerSkipInterval = setInterval(function(){
            if(renderer.timerSkip)
                remote.app.adjustTimer(skipVal);
        }, 500)            
    }, 500);
}

function stopTimerSkip(){
    clearInterval(renderer.timerSkipInterval);
    clearTimeout(renderer.mouseTimeout);
    renderer.timerSkip = false;
}



function disableTimerControls(){
    
    // Display/Hide
    var ctrls = $("#timerControls");
    ctrls.animate({opacity: 0}, 500)
    ctrls.off("mouseenter");
    ctrls.off("mouseleave");

    // Disable button events
    $("#timerUp").off("click");
    $("#timerUp").off("mousedown");
    $("#timerUp").off("mouseup");
    $("#timerDown").off("click");
    $("#timerDown").off("mousedown");
    $("#timerDown").off("mouseup");
}


function enableStateControls(){
    
    // Display/Hide
    var ctrls = $("#stateControls");
    ctrls.on("mouseenter", function(){
        ctrls.animate({opacity: 1}, 300)
    });

    ctrls.on("mouseleave", function(){
        ctrls.animate({opacity: 0}, 500)
    });

    // Button events
    $("#stateStart").on("click", function(){
        remote.app.startTimer();       
    });

    $("#statePause").on("click", function(){
        remote.app.pauseTimer();
    });

    $("#stateReset").on("click", function(){
        remote.app.resetTimer();
    });
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







