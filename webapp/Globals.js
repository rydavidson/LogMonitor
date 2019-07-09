var controller;
var DO_ASSERTIONS = true; // use this to toggle assertions
var CONFIG;

function onInit(){
    controller = new Controller();
    controller.requestTargetList();
    setInterval(controller.onTick, 1000 );     
}

function assert(condition, msg, location){
    if(DO_ASSERTIONS && ! condition){
        var assertMessage = 'ASSERTION ERROR: [' + location + ']' + msg;
        //alert(assertMessage);
        throw new Error(assertMessage);
    }
}

function debug(msg){
    if (console){
     // Firebug uses this
        console.log(msg);
    } else {
        alert('DEBUG: ' + msg);
    }
}
